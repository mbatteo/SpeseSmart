import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertCategorySchema, insertAccountSchema, insertBudgetSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle transazioni" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transazione non trovata" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero della transazione" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      console.log("Received transaction data:", req.body);
      
      const validatedData = insertTransactionSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Transaction validation error:", error);
      if (error.issues) {
        console.error("Zod validation issues:", error.issues);
      }
      res.status(400).json({ 
        message: "Dati transazione non validi", 
        details: error.issues || error.message 
      });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transazione non trovata" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Dati transazione non validi" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transazione non trovata" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione della transazione" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle categorie" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Dati categoria non validi" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Categoria non trovata" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Dati categoria non validi" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Categoria non trovata" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione della categoria" });
    }
  });

  // Account routes
  app.get("/api/accounts", isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei conti" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Dati conto non validi" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(req.params.id, validatedData);
      if (!account) {
        return res.status(404).json({ message: "Conto non trovato" });
      }
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Dati conto non validi" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Conto non trovato" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione del conto" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei budget" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ message: "Dati budget non validi" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(req.params.id, validatedData);
      if (!budget) {
        return res.status(404).json({ message: "Budget non trovato" });
      }
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Dati budget non validi" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBudget(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget non trovato" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione del budget" });
    }
  });

  // Dashboard analytics routes
  app.get("/api/analytics/monthly-summary", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const categories = await storage.getCategories();
      const accounts = await storage.getAccounts();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      const totalExpenses = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const transactionCount = monthlyTransactions.length;
      const dailyAverage = totalExpenses / now.getDate();

      const categorySpending = categories.map(category => {
        const categoryTransactions = monthlyTransactions.filter(t => t.categoryId === category.id);
        const total = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return {
          ...category,
          amount: total,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
        };
      }).sort((a, b) => b.amount - a.amount);

      res.json({
        totalExpenses,
        transactionCount,
        dailyAverage,
        categorySpending,
        remainingBudget: 4000 - totalExpenses, // Mock budget
        budgetUsedPercentage: totalExpenses / 4000 * 100
      });
    } catch (error) {
      res.status(500).json({ message: "Errore nel calcolo delle statistiche" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
