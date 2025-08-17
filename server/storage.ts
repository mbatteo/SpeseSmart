import { 
  type Transaction, 
  type InsertTransaction, 
  type Category, 
  type InsertCategory, 
  type Account, 
  type InsertAccount, 
  type Budget, 
  type InsertBudget,
  type User,
  type UpsertUser,
  users,
  transactions,
  categories,
  accounts,
  budgets
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;
  
  // Budgets
  getBudgets(): Promise<Budget[]>;
  getBudgetById(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) return;

    // Default categories
    const defaultCategories = [
      { name: 'Alimentari', color: '#EF4444', icon: 'fas fa-shopping-cart' },
      { name: 'Trasporti', color: '#3B82F6', icon: 'fas fa-bus' },
      { name: 'Shopping', color: '#10B981', icon: 'fas fa-shopping-bag' },
      { name: 'Bollette', color: '#F59E0B', icon: 'fas fa-bolt' },
      { name: 'Intrattenimento', color: '#8B5CF6', icon: 'fas fa-film' },
      { name: 'Salute', color: '#EC4899', icon: 'fas fa-heartbeat' },
      { name: 'Altro', color: '#6B7280', icon: 'fas fa-tag' },
    ];

    await db.insert(categories).values(defaultCategories);

    // Default accounts
    const defaultAccounts = [
      { name: 'Conto Corrente', type: 'checking', balance: '2500.00' },
      { name: 'Carta di Credito', type: 'credit', balance: '0.00' },
      { name: 'Carta di Debito', type: 'debit', balance: '500.00' },
      { name: 'Contanti', type: 'cash', balance: '150.00' },
    ];

    await db.insert(accounts).values(defaultAccounts);
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(transactions.date);
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const date = typeof insertTransaction.date === 'string' 
      ? new Date(insertTransaction.date)
      : insertTransaction.date;
    
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        date,
      })
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, update: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updateData: any = { ...update };
    if (update.date) {
      updateData.date = typeof update.date === 'string' ? new Date(update.date) : update.date;
    }
    
    const [transaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values({
        ...insertCategory,
        color: insertCategory.color || '#6B7280',
        icon: insertCategory.icon || 'fas fa-tag'
      })
      .returning();
    return category;
  }

  async updateCategory(id: string, update: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(update)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts);
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values({
        ...insertAccount,
        balance: insertAccount.balance || '0'
      })
      .returning();
    return account;
  }

  async updateAccount(id: string, update: Partial<InsertAccount>): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set(update)
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return await db.select().from(budgets);
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values({
        ...insertBudget,
        period: insertBudget.period || 'monthly',
        month: insertBudget.month || null
      })
      .returning();
    return budget;
  }

  async updateBudget(id: string, update: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [budget] = await db
      .update(budgets)
      .set(update)
      .where(eq(budgets.id, id))
      .returning();
    return budget;
  }

  async deleteBudget(id: string): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();