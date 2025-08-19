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

  // Route per ottenere statistiche mensili della dashboard con dati dinamici
  app.get("/api/analytics/monthly-summary", isAuthenticated, async (req, res) => {
    try {
      // Recupero tutti i dati necessari dal database
      const transactions = await storage.getTransactions();
      const categories = await storage.getCategories();
      const accounts = await storage.getAccounts();
      
      // Calcolo le date per questo mese e il mese scorso
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Data di inizio del mese corrente
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      // Data di inizio del mese scorso
      const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
      // Data di inizio di questo mese (per confrontare con il mese scorso)
      const endOfLastMonth = new Date(currentYear, currentMonth, 0);
      
      // Filtro transazioni del mese corrente
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      // Filtro transazioni del mese scorso per il confronto
      const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
      });

      // Filtro transazioni di oggi
      const today = new Date();
      const todayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === today.toDateString();
      });

      // Calcolo le statistiche principali
      const totalExpenses = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const lastMonthExpenses = lastMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const transactionCount = monthlyTransactions.length;
      const dailyAverage = totalExpenses / now.getDate();
      
      // Calcolo il confronto percentuale con il mese scorso
      const monthlyChange = lastMonthExpenses !== 0 
        ? ((totalExpenses - lastMonthExpenses) / Math.abs(lastMonthExpenses)) * 100 
        : 0;
      
      // Calcolo transazioni di oggi
      const todayTransactionCount = todayTransactions.length;
      
      // Determino il trend della media giornaliera
      const lastWeekAverage = totalExpenses / 7; // Media ultimi 7 giorni del mese
      const trendStatus = dailyAverage > lastWeekAverage * 1.1 ? 'In crescita' 
                        : dailyAverage < lastWeekAverage * 0.9 ? 'In calo' 
                        : 'Stabile';

      const categorySpending = categories.map(category => {
        const categoryTransactions = monthlyTransactions.filter(t => t.categoryId === category.id);
        const total = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return {
          ...category,
          amount: total,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
        };
      }).sort((a, b) => b.amount - a.amount);

      // Creo la risposta JSON con tutti i dati dinamici calcolati
      res.json({
        totalExpenses, // Spese totali del mese
        transactionCount, // Numero transazioni del mese
        dailyAverage, // Media giornaliera delle spese
        categorySpending, // Spese per categoria con percentuali
        remainingBudget: 4000 - totalExpenses, // Budget rimanente (TODO: rendere dinamico)
        budgetUsedPercentage: totalExpenses / 4000 * 100, // Percentuale budget utilizzata
        // Nuovi dati dinamici per sostituire quelli hardcodati
        monthlyChange, // Variazione percentuale vs mese scorso
        todayTransactionCount, // Numero transazioni di oggi
        trendStatus, // Trend della media giornaliera
      });
    } catch (error) {
      res.status(500).json({ message: "Errore nel calcolo delle statistiche" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
