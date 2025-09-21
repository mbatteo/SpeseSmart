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
  type PasswordResetToken,
  type InsertPasswordResetToken,
  users,
  transactions,
  categories,
  accounts,
  budgets,
  passwordResetTokens
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Local authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createLocalUser(userData: { email: string; passwordHash: string; firstName: string; lastName: string }): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  incrementUserTokenVersion(userId: string): Promise<void>;
  
  // Password reset token operations
  createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getValidPasswordResetToken(userId: string, tokenHash: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: string): Promise<void>;
  cleanupExpiredPasswordResetTokens(): Promise<void>;
  
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

  private normalizeAmount(value: number | string): string {
    if (typeof value === 'string') {
      const normalized = Number(value.replace(/\s/g, '').replace(',', '.'));
      if (!Number.isFinite(normalized)) throw new Error('Invalid amount');
      return normalized.toFixed(2);
    }
    if (!Number.isFinite(value)) throw new Error('Invalid amount');
    return value.toFixed(2);
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

  // Local authentication operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createLocalUser(userData: { email: string; passwordHash: string; firstName: string; lastName: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        emailVerified: false,
        tokenVersion: '0',
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async incrementUserTokenVersion(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const newVersion = (parseInt(user.tokenVersion || '0') + 1).toString();
      await db
        .update(users)
        .set({
          tokenVersion: newVersion,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  // Password reset token operations
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db
      .insert(passwordResetTokens)
      .values(tokenData)
      .returning();
    return token;
  }

  async getValidPasswordResetToken(userId: string, tokenHash: string): Promise<PasswordResetToken | undefined> {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );
    return token;
  }

  async markPasswordResetTokenAsUsed(tokenId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
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
        amount: this.normalizeAmount(insertTransaction.amount as number | string),
      })
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, update: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updateData: any = { ...update };
    if (update.date) {
      updateData.date = typeof update.date === 'string' ? new Date(update.date) : update.date;
    }
    if (update.amount !== undefined) {
      updateData.amount = this.normalizeAmount(update.amount as number | string);
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