// Importo le funzioni necessarie per creare il database schema
import { sql } from "drizzle-orm"; // Per funzioni SQL native
import { pgTable, text, varchar, decimal, timestamp, uuid, index, jsonb, boolean } from "drizzle-orm/pg-core"; // Tipi di colonne PostgreSQL
import { createInsertSchema } from "drizzle-zod"; // Crea schema di validazione automatici
import { z } from "zod"; // Libreria per validare i dati in ingresso

// Tabella per le categorie delle spese (alimentari, trasporti, ecc.)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID unico generato automaticamente
  name: text("name").notNull(), // Nome della categoria (es: "Alimentari")
  localizedName: text("localized_name"), // Nome localizzato per matching fallback (es: "Groceries" per "Alimentari")
  color: text("color").notNull().default('#6B7280'), // Colore per visualizzare la categoria
  icon: text("icon").notNull().default('fas fa-tag'), // Icona della categoria
});

// Tabella per i conti bancari, carte di credito, contanti
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID unico
  name: text("name").notNull(), // Nome del conto (es: "Carta Intesa", "Contanti")
  type: text("type").notNull(), // Tipo: 'checking' (conto corrente), 'credit' (carta credito), 'debit' (carta debito), 'cash' (contanti)
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default('0'), // Saldo del conto (precisione 10 cifre, 2 decimali)
});

// Tabella principale per tutte le transazioni (spese e entrate)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID unico della transazione
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Importo (negativo per spese, positivo per entrate)
  description: text("description").notNull(), // Descrizione della transazione (es: "Spesa supermercato")
  date: timestamp("date").notNull(), // Data e ora della transazione
  categoryId: varchar("category_id").references(() => categories.id).notNull(), // Collegamento alla categoria
  accountId: varchar("account_id").references(() => accounts.id).notNull(), // Collegamento al conto utilizzato
  importedCategoryRaw: text("imported_category_raw"), // Categoria originale dal CSV per il matching
  confirmed: boolean("confirmed").default(false), // Se la categoria è stata confermata manualmente dall'utente
  createdAt: timestamp("created_at").default(sql`now()`), // Quando è stata creata nel sistema
});

// Tabella per i budget/limiti di spesa per categoria
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID unico
  categoryId: varchar("category_id").references(() => categories.id).notNull(), // Categoria del budget
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Limite di spesa
  period: text("period").notNull().default('monthly'), // Periodo: 'monthly' (mensile) o 'yearly' (annuale)
  year: text("year").notNull(), // Anno del budget (es: "2025")
  month: text("month"), // Mese del budget (es: "01" per gennaio), null per budget annuali
});

// Tabella per memorizzare le sessioni utente (necessaria per l'autenticazione)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(), // ID della sessione
    sess: jsonb("sess").notNull(), // Dati della sessione in formato JSON
    expire: timestamp("expire").notNull(), // Quando scade la sessione
  },
  (table) => [index("IDX_session_expire").on(table.expire)], // Indice per velocizzare le query sulle scadenze
);

// Tabella degli utenti registrati nell'applicazione
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID utente unico
  email: varchar("email").unique(), // Email dell'utente (deve essere unica)
  firstName: varchar("first_name"), // Nome dell'utente
  lastName: varchar("last_name"), // Cognome dell'utente
  profileImageUrl: varchar("profile_image_url"), // URL dell'immagine profilo dell'utente
  passwordHash: varchar("password_hash"), // Hash bcrypt della password (null per utenti OAuth)
  emailVerified: boolean("email_verified").default(false), // Se l'email è stata verificata
  tokenVersion: text("token_version").default('0'), // Versione token per invalidare sessioni
  lastLogin: timestamp("last_login"), // Ultimo accesso dell'utente
  createdAt: timestamp("created_at").defaultNow(), // Quando è stato creato l'account
  updatedAt: timestamp("updated_at").defaultNow(), // Ultimo aggiornamento dei dati utente
});

// Tabella per i token di reset password
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID token unico
  userId: varchar("user_id").references(() => users.id).notNull(), // Collegamento all'utente
  tokenHash: text("token_hash").notNull(), // Hash SHA-256 del token sicuro
  expiresAt: timestamp("expires_at").notNull(), // Scadenza del token (default 1 ora)
  used: boolean("used").default(false), // Se il token è già stato utilizzato
  requestIp: varchar("request_ip"), // IP della richiesta per logging sicurezza
  createdAt: timestamp("created_at").defaultNow(), // Quando è stato creato
}, (table) => [
  index("IDX_password_reset_user").on(table.userId), // Indice per velocizzare ricerche per utente
  index("IDX_password_reset_expires").on(table.expiresAt), // Indice per cleanup token scaduti
]);

// SCHEMA DI VALIDAZIONE Zod per i dati in ingresso (rimuovono campi auto-generati)

// Schema per validare l'inserimento di una nuova categoria
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true, // L'ID viene generato automaticamente dal database
});

// Schema per validare l'inserimento di un nuovo conto
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true, // L'ID viene generato automaticamente
});

// Schema per validare l'inserimento di una nuova transazione
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true, // L'ID viene generato automaticamente
  createdAt: true, // La data di creazione viene impostata automaticamente
}).extend({
  // Trasformo la data da stringa a oggetto Date se necessario
  date: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val); // Converto stringa in Date
    }
    return val; // Se è già Date, la lascio così
  }),
  // L'importo può essere numero o stringa (da CSV), lo trasformo sempre in numero
  amount: z.number().or(z.string().transform(val => parseFloat(val))),
});

// Schema per validare l'inserimento di un nuovo budget
export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true, // L'ID viene generato automaticamente
});

// Schemi per l'autenticazione locale
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true, // L'ID viene generato automaticamente
  createdAt: true, // La data viene impostata automaticamente
});

// Schema per registrazione utente locale
export const localUserRegistrationSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  passwordConfirm: z.string(),
  firstName: z.string().min(1, "Nome richiesto"),
  lastName: z.string().min(1, "Cognome richiesto"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Le password non coincidono",
  path: ["passwordConfirm"],
});

// Schema per login utente locale
export const localUserLoginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta"),
});

// Schema per richiesta reset password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email non valida"),
});

// Schema per reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token richiesto"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Le password non coincidono", 
  path: ["passwordConfirm"],
});

// TIPI TypeScript finali per utilizzare i dati nell'applicazione

// Tipi per inserire nuovi dati (senza ID auto-generati)
export type InsertCategory = z.infer<typeof insertCategorySchema>; // Tipo per inserire categoria
export type InsertAccount = z.infer<typeof insertAccountSchema>; // Tipo per inserire conto
export type InsertTransaction = z.infer<typeof insertTransactionSchema>; // Tipo per inserire transazione
export type InsertBudget = z.infer<typeof insertBudgetSchema>; // Tipo per inserire budget
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>; // Tipo per token reset password

// Tipi per l'autenticazione locale
export type LocalUserRegistration = z.infer<typeof localUserRegistrationSchema>; // Tipo per registrazione
export type LocalUserLogin = z.infer<typeof localUserLoginSchema>; // Tipo per login
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>; // Tipo per richiesta reset
export type ResetPassword = z.infer<typeof resetPasswordSchema>; // Tipo per reset password

// Tipi per leggere dati dal database (con tutti i campi inclusi ID)
export type Category = typeof categories.$inferSelect; // Tipo per categoria dal database
export type Account = typeof accounts.$inferSelect; // Tipo per conto dal database
export type Transaction = typeof transactions.$inferSelect; // Tipo per transazione dal database
export type Budget = typeof budgets.$inferSelect; // Tipo per budget dal database
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect; // Tipo per token reset password

// Tipi speciali per l'autenticazione utente
export type UpsertUser = typeof users.$inferInsert; // Tipo per creare/aggiornare utente
export type User = typeof users.$inferSelect; // Tipo per utente dal database


