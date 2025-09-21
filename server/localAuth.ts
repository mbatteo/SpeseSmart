import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { Express, Request, Response } from 'express';
import { storage } from './storage';
import { 
  localUserRegistrationSchema, 
  localUserLoginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '@shared/schema';

// Configuration constants (environment variables)
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const RESET_TOKEN_EXPIRY = parseInt(process.env.RESET_TOKEN_EXPIRY || '3600'); // 1 hour in seconds
const RESET_TOKEN_BYTES = parseInt(process.env.RESET_TOKEN_BYTES || '32');
const APP_URL = process.env.APP_URL || 'https://your-repl-name.your-username.repl.co';

// Rate limiting maps (in-memory for simplicity, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting helper
function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Hash token for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate secure token
function generateSecureToken(): string {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString('base64url');
}

// Send email (placeholder - implement with nodemailer)
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // TODO: Implement with nodemailer when SMTP is configured
  console.log('--- EMAIL DEBUG ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log('--- END EMAIL ---');
}

export function setupLocalAuth(app: Express) {
  // Registrazione utente locale
  app.post('/api/auth/local/register', async (req: Request, res: Response) => {
    try {
      // Rate limiting per IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      if (!checkRateLimit(`register:${clientIp}`, 5, 60 * 60 * 1000)) { // 5 per hour
        return res.status(429).json({ 
          message: 'Troppi tentativi di registrazione. Riprova tra un\'ora.' 
        });
      }

      const validationResult = localUserRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Dati non validi', 
          errors: validationResult.error.errors 
        });
      }

      const { email, password, firstName, lastName } = validationResult.data;

      // Controlla se l'utente esiste già
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Un account con questa email esiste già' 
        });
      }

      // Hash della password
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Crea l'utente
      const user = await storage.createLocalUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });

      // Log evento di sicurezza
      console.log(`[SECURITY] User registered: ${user.id} (${email}) from IP: ${clientIp}`);

      res.status(201).json({ 
        message: 'Account creato con successo. Puoi ora effettuare il login.',
        userId: user.id
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  });

  // Login utente locale
  app.post('/api/auth/local/login', async (req: Request, res: Response) => {
    try {
      // Rate limiting per IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      if (!checkRateLimit(`login:${clientIp}`, 10, 15 * 60 * 1000)) { // 10 per 15 min
        return res.status(429).json({ 
          message: 'Troppi tentativi di login. Riprova tra 15 minuti.' 
        });
      }

      const validationResult = localUserLoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Dati non validi', 
          errors: validationResult.error.errors 
        });
      }

      const { email, password } = validationResult.data;

      // Trova utente per email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        // Rate limiting per email per prevenire user enumeration
        checkRateLimit(`login-email:${email}`, 5, 15 * 60 * 1000); // 5 per 15 min
        return res.status(401).json({ 
          message: 'Email o password non corretti' 
        });
      }

      // Verifica password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        // Rate limiting per email
        checkRateLimit(`login-email:${email}`, 5, 15 * 60 * 1000);
        console.log(`[SECURITY] Failed login attempt for: ${email} from IP: ${clientIp}`);
        return res.status(401).json({ 
          message: 'Email o password non corretti' 
        });
      }

      // Imposta sessione utente (simula i dati Replit OAuth per compatibilità)
      (req as any).user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
        }
      };

      // Salva sessione
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Log evento di sicurezza
      console.log(`[SECURITY] User logged in: ${user.id} (${email}) from IP: ${clientIp}`);

      res.json({ 
        message: 'Login effettuato con successo',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  });

  // Forgot password - richiesta reset
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      // Rate limiting per IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      if (!checkRateLimit(`forgot:${clientIp}`, 10, 60 * 60 * 1000)) { // 10 per hour
        return res.status(429).json({ 
          message: 'Troppi tentativi di reset. Riprova tra un\'ora.' 
        });
      }

      const validationResult = forgotPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Email non valida', 
          errors: validationResult.error.errors 
        });
      }

      const { email } = validationResult.data;

      // SEMPRE restituire lo stesso messaggio generico per evitare user enumeration
      const genericMessage = 'Se esiste un account associato all\'email, riceverai un\'email con le istruzioni per reimpostare la password.';

      // Rate limiting per email
      if (!checkRateLimit(`forgot-email:${email}`, 3, 60 * 60 * 1000)) { // 3 per hour per email
        return res.json({ message: genericMessage });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Log del tentativo ma non rivelare che l'utente non esiste
        console.log(`[SECURITY] Password reset attempted for non-existent user: ${email} from IP: ${clientIp}`);
        return res.json({ message: genericMessage });
      }

      // Genera token sicuro
      const token = generateSecureToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY * 1000);

      // Salva token nel database
      await storage.createPasswordResetToken({
        userId: user.id,
        tokenHash,
        expiresAt,
        requestIp: clientIp,
        used: false,
      });

      // Genera link di reset
      const resetLink = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

      // Invia email
      const emailSubject = 'Reimpostazione Password - Personal Finance Tracker';
      const emailBody = `
Ciao ${user.firstName},

Hai richiesto di reimpostare la password per il tuo account.

Clicca sul link seguente per impostare una nuova password:
${resetLink}

Questo link scadrà tra 1 ora.

Se non hai richiesto questa reimpostazione, ignora questa email.

Saluti,
Il team Personal Finance Tracker
      `.trim();

      await sendEmail(user.email!, emailSubject, emailBody);

      // Log evento di sicurezza
      console.log(`[SECURITY] Password reset requested for: ${user.id} (${email}) from IP: ${clientIp}`);

      res.json({ message: genericMessage });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  });

  // Reset password - imposta nuova password
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      // Rate limiting per IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      if (!checkRateLimit(`reset:${clientIp}`, 10, 60 * 60 * 1000)) { // 10 per hour
        return res.status(429).json({ 
          message: 'Troppi tentativi di reset. Riprova tra un\'ora.' 
        });
      }

      const validationResult = resetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Dati non validi', 
          errors: validationResult.error.errors 
        });
      }

      const { token, email, password } = validationResult.data;

      // Trova utente per email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`[SECURITY] Password reset attempted for non-existent user: ${email} from IP: ${clientIp}`);
        return res.status(400).json({ 
          message: 'Token non valido o scaduto. Richiedi nuovamente il reset della password.' 
        });
      }

      // Verifica token
      const tokenHash = hashToken(token);
      const resetToken = await storage.getValidPasswordResetToken(user.id, tokenHash);
      
      if (!resetToken) {
        console.log(`[SECURITY] Invalid/expired reset token used for: ${user.id} (${email}) from IP: ${clientIp}`);
        return res.status(400).json({ 
          message: 'Token non valido o scaduto. Richiedi nuovamente il reset della password.' 
        });
      }

      // Hash nuova password
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Aggiorna password utente
      await storage.updateUserPassword(user.id, passwordHash);

      // Marca token come utilizzato
      await storage.markPasswordResetTokenAsUsed(resetToken.id);

      // Invalida tutte le sessioni attive incrementando tokenVersion
      await storage.incrementUserTokenVersion(user.id);

      // Log evento di sicurezza
      console.log(`[SECURITY] Password reset completed for: ${user.id} (${email}) from IP: ${clientIp}`);

      // Invia email di notifica
      const notificationSubject = 'Password Cambiata - Personal Finance Tracker';
      const notificationBody = `
Ciao ${user.firstName},

La password del tuo account è stata modificata con successo.

Se non hai effettuato tu questa modifica, contattaci immediatamente.

Data e ora: ${new Date().toLocaleString('it-IT')}
IP: ${clientIp}

Saluti,
Il team Personal Finance Tracker
      `.trim();

      await sendEmail(user.email!, notificationSubject, notificationBody);

      res.json({ 
        message: 'Password reimpostata con successo. Tutte le sessioni attive sono state invalidate.' 
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  });

  // Cleanup periodico dei token scaduti (chiamare periodicamente)
  app.post('/api/auth/cleanup-expired-tokens', async (req: Request, res: Response) => {
    try {
      await storage.cleanupExpiredPasswordResetTokens();
      res.json({ message: 'Token scaduti eliminati con successo' });
    } catch (error) {
      console.error('Token cleanup error:', error);
      res.status(500).json({ message: 'Errore durante la pulizia dei token' });
    }
  });
}