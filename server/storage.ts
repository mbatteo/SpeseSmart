import { type Transaction, type InsertTransaction, type Category, type InsertCategory, type Account, type InsertAccount, type Budget, type InsertBudget } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private categories: Map<string, Category>;
  private accounts: Map<string, Account>;
  private budgets: Map<string, Budget>;

  constructor() {
    this.transactions = new Map();
    this.categories = new Map();
    this.accounts = new Map();
    this.budgets = new Map();
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default categories
    const defaultCategories: Category[] = [
      { id: randomUUID(), name: 'Alimentari', color: '#EF4444', icon: 'fas fa-shopping-cart' },
      { id: randomUUID(), name: 'Trasporti', color: '#3B82F6', icon: 'fas fa-bus' },
      { id: randomUUID(), name: 'Shopping', color: '#10B981', icon: 'fas fa-shopping-bag' },
      { id: randomUUID(), name: 'Bollette', color: '#F59E0B', icon: 'fas fa-bolt' },
      { id: randomUUID(), name: 'Intrattenimento', color: '#8B5CF6', icon: 'fas fa-film' },
      { id: randomUUID(), name: 'Salute', color: '#EC4899', icon: 'fas fa-heartbeat' },
      { id: randomUUID(), name: 'Altro', color: '#6B7280', icon: 'fas fa-tag' },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Default accounts
    const defaultAccounts: Account[] = [
      { id: randomUUID(), name: 'Conto Corrente', type: 'checking', balance: '2500.00' },
      { id: randomUUID(), name: 'Carta di Credito', type: 'credit', balance: '0.00' },
      { id: randomUUID(), name: 'Carta di Debito', type: 'debit', balance: '500.00' },
      { id: randomUUID(), name: 'Contanti', type: 'cash', balance: '150.00' },
    ];

    defaultAccounts.forEach(account => {
      this.accounts.set(account.id, account);
    });
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: new Date(insertTransaction.date),
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction: Transaction = {
      ...transaction,
      ...updates,
      date: updates.date ? new Date(updates.date) : transaction.date,
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...insertCategory, 
      id,
      color: insertCategory.color || '#6B7280',
      icon: insertCategory.icon || 'fas fa-tag'
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory: Category = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = { 
      ...insertAccount, 
      id,
      balance: insertAccount.balance || '0'
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updates: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;

    const updatedAccount: Account = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Budget methods
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = { 
      ...insertBudget, 
      id,
      period: insertBudget.period || 'monthly',
      month: insertBudget.month || null
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;

    const updatedBudget: Budget = { ...budget, ...updates };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }
}

export const storage = new MemStorage();
