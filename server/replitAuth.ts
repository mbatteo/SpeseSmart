
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import memoize from "memoizee";
import { storage } from "./storage";

// import statico solo per i tipi TypeScript
import type { VerifyFunction } from "openid-client/passport";

let client: any;
let Strategy: any;

const isLocal = process.env.NODE_ENV === "development";

// import dinamico solo se non siamo in locale
if (!isLocal) {
  client = await import("openid-client");
  ({ Strategy } = await import("openid-client/passport"));

  if (!process.env.REPLIT_DOMAINS) {
    throw new Error("Environment variable REPLIT_DOMAINS not provided");
  }
}

// ---------------------- SESSIONE ----------------------
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 settimana
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    // in sviluppo lasciamo che crei automaticamente la tabella se manca
    createTableIfMissing: isLocal ? true : false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  // log errori del store per debug
  // @ts-ignore (run-time)
  if (typeof sessionStore.on === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionStore.on("error", (err: any) => console.error("Session store error:", err));
  }

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// ---------------------- UTILI PER SESSIONE ----------------------
function updateUserSession(user: any, tokens: any) {
  user.claims = tokens.claims?.();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

// ---------------------- SETUP AUTH ----------------------
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // session + passport inizializzazione
  app.use(getSession());
  app.use(passport.initialize());

  // ===== SERIALIZE / DESERIALIZE =====
  passport.serializeUser((user: any, cb) => {
    try {
      const id = user?.claims?.sub ?? user?.id;
      if (!id) return cb(new Error("No user id to serialize"));
      cb(null, id);
    } catch (err) {
      cb(err as Error);
    }
  });

  passport.deserializeUser(async (id: any, cb) => {
    try {
      if (!id) return cb(null, false);
      if (typeof storage.getUserById === "function") {
        const dbUser = await storage.getUserById(id);
        if (!dbUser) return cb(null, false);

        const userObject = {
          claims: {
            sub: dbUser.id,
            email: dbUser.email,
            first_name: dbUser.firstName,
            last_name: dbUser.lastName,
            profile_image_url: dbUser.profileImageUrl,
          },
          expires_at: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        };
        return cb(null, userObject);
      } else {
        console.warn("storage.getUserById non implementato — deserializzo un user minimale");
        return cb(null, { claims: { sub: id }, expires_at: Math.floor(Date.now() / 1000) + 3600 });
      }
    } catch (err) {
      cb(err as Error);
    }
  });

  app.use(passport.session());

  // ===== ROUTE LOGIN / CALLBACK / LOGOUT IN LOCALE =====
  if (isLocal) {
    console.log("Modalità sviluppo locale: autenticazione Replit disabilitata (ma passport attivo per sessioni locali)");

    // Login fittizio
    app.get("/api/login", (req, res) => {
      req.login(
        {
          claims: { sub: "local-user", email: "test@example.com" },
          expires_at: Math.floor(Date.now() / 1000) + 31536000,
        },
        (err) => {
          if (err) return res.status(500).json({ message: "Login fallito" });
          res.redirect("/"); // redirect alla homepage
        }
      );
    });

    // Callback fittizio
    app.get("/api/callback", (req, res) => {
      res.redirect("/"); // redirect alla homepage
    });

    // Logout
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/"); // redirect alla homepage
      });
    });

    return;
  }

  // ---------------------- CONFIGURAZIONE OIDC ----------------------
  const getOidcConfig = memoize(
    async () => {
      return await client.discovery(new URL(process.env.ISSUER_URL!), process.env.REPL_ID!);
    },
    { maxAge: 3600 * 1000 }
  );

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    const claims = tokens.claims();
    await upsertUser(claims);

    if (claims?.sub) {
      await storage.initializeUserData(claims.sub);
    }

    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify
    );
    passport.use(strategy);
  }

  // Login / callback / logout reali OIDC
  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// ---------------------- MIDDLEWARE IS AUTHENTICATED ----------------------
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (isLocal) {
    if (!req.user) {
      req.user = {
        claims: { sub: "local-user" },
        expires_at: Math.floor(Date.now() / 1000) + 31536000,
      };
    }
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const getOidcConfig = memoize(
      async () => {
        return await client.discovery(new URL(process.env.ISSUER_URL!), process.env.REPL_ID!);
      },
      { maxAge: 3600 * 1000 }
    );

    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
