// Importo le funzioni necessarie per creare il database schema
import { sql } from "drizzle-orm"; // Per funzioni SQL native
import { pgTable, text, varchar, decimal, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core"; // Tipi di colonne PostgreSQL
import { createInsertSchema } from "drizzle-zod"; // Crea schema di validazione automatici
import { z } from "zod"; // Libreria per validare i dati in ingresso

// Tabella per le categorie delle spese (alimentari, trasporti, ecc.)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ID unico generato automaticamente
  name: text("name").notNull(), // Nome della categoria (es: "Alimentari")
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
  createdAt: timestamp("created_at").defaultNow(), // Quando è stato creato l'account
  updatedAt: timestamp("updated_at").defaultNow(), // Ultimo aggiornamento dei dati utente
});

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

// TIPI TypeScript finali per utilizzare i dati nell'applicazione

// Tipi per inserire nuovi dati (senza ID auto-generati)
export type InsertCategory = z.infer<typeof insertCategorySchema>; // Tipo per inserire categoria
export type InsertAccount = z.infer<typeof insertAccountSchema>; // Tipo per inserire conto
export type InsertTransaction = z.infer<typeof insertTransactionSchema>; // Tipo per inserire transazione
export type InsertBudget = z.infer<typeof insertBudgetSchema>; // Tipo per inserire budget

// Tipi per leggere dati dal database (con tutti i campi inclusi ID)
export type Category = typeof categories.$inferSelect; // Tipo per categoria dal database
export type Account = typeof accounts.$inferSelect; // Tipo per conto dal database
export type Transaction = typeof transactions.$inferSelect; // Tipo per transazione dal database
export type Budget = typeof budgets.$inferSelect; // Tipo per budget dal database

// Tipi speciali per l'autenticazione utente
export type UpsertUser = typeof users.$inferInsert; // Tipo per creare/aggiornare utente
export type User = typeof users.$inferSelect; // Tipo per utente dal database


