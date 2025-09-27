import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testConnection } from "./db";

const app = express();

// Parsing JSON e urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware per log delle API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Funzione principale per avviare l'app
async function startApp() {
  try {
    log("🚀 Avvio applicazione SpeseSmart...");
    
    // Prima controlla la connessione al database
    log("🔍 Controllo connessione database...");
    
    const connected = await testConnection();
    if (!connected) {
      log("❌ ERRORE: Impossibile connettersi al database!");
      if (process.env.NODE_ENV === "development") {
        log("💡 Assicurati che Docker sia avviato: docker-compose up -d");
      }
      process.exit(1);
    }
    
    log("✅ Database connesso!");

    // Registra le routes
    log("📋 Registrazione routes...");
    const server = await registerRoutes(app);

    // Middleware globale per gestione errori
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log dell'errore per debug
      log(`❌ Errore ${status}: ${message}`);
      if (err.stack && process.env.NODE_ENV === "development") {
        console.error(err.stack);
      }

      res.status(status).json({ message });
    });

    // Setup Vite solo in sviluppo
    if (app.get("env") === "development") {
      log("🛠️ Setup Vite per sviluppo...");
      await setupVite(app, server);
    } else {
      log("📦 Servizio file statici per produzione...");
      serveStatic(app);
    }

    // Porta e avvio server
    const port = parseInt(process.env.PORT || "5000", 10);

    // In locale non specifichiamo host per evitare ENOTSUP
    server.listen(port, () => {
      log(`✅ Server SpeseSmart in esecuzione su http://localhost:${port}`);
      log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      log(`🗄️ Database: ${process.env.DATABASE_URL?.includes('localhost') ? 'Docker locale' : 'Produzione'}`);
    });

  } catch (error) {
    log("💥 Errore critico durante l'avvio dell'applicazione:");
    console.error(error);
    process.exit(1);
  }
}

// Avvia l'applicazione
startApp();