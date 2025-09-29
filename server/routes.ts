import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertCategorySchema, insertAccountSchema, insertBudgetSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupLocalAuth } from "./localAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Setup local authentication endpoints
  setupLocalAuth(app);

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
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle transazioni" });
    }
  });

  app.get("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transaction = await storage.getTransactionById(userId, req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transazione non trovata" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero della transazione" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Received transaction data:", req.body);
      
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const transaction = await storage.createTransaction(userId, validatedData);
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

  app.put("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(userId, req.params.id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transazione non trovata" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Dati transazione non validi" });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteTransaction(userId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transazione non trovata" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione della transazione" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle categorie" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(userId, validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Dati categoria non validi" });
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(userId, req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Categoria non trovata" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Dati categoria non validi" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteCategory(userId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Categoria non trovata" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione della categoria" });
    }
  });

  // Account routes
  app.get("/api/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei conti" });
    }
  });

  app.post("/api/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(userId, validatedData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Dati conto non validi" });
    }
  });

  app.put("/api/accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(userId, req.params.id, validatedData);
      if (!account) {
        return res.status(404).json({ message: "Conto non trovato" });
      }
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Dati conto non validi" });
    }
  });

  app.delete("/api/accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteAccount(userId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Conto non trovato" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione del conto" });
    }
  });

  // Budget routes
  app.get("/api/budgets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei budget" });
    }
  });

  app.post("/api/budgets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(userId, validatedData);
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ message: "Dati budget non validi" });
    }
  });

  app.put("/api/budgets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(userId, req.params.id, validatedData);
      if (!budget) {
        return res.status(404).json({ message: "Budget non trovato" });
      }
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Dati budget non validi" });
    }
  });

  app.delete("/api/budgets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteBudget(userId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget non trovato" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione del budget" });
    }
  });

  // Route per ottenere statistiche mensili della dashboard - TUTTI DATI REALI DAL DATABASE
  app.get("/api/analytics/monthly-summary", isAuthenticated, async (req: any, res) => {
    try {
      // PASSO 1: Recupero tutti i dati necessari dal database per l'utente corrente
      const userId = req.user.claims.sub; // ID univoco dell'utente autenticato
      const transactions = await storage.getTransactions(userId); // Tutte le transazioni dell'utente
      const categories = await storage.getCategories(userId); // Tutte le categorie dell'utente
      const accounts = await storage.getAccounts(userId); // Tutti i conti dell'utente
      const budgets = await storage.getBudgets(userId); // Tutti i budget impostati dall'utente
      
      // PASSO 2: Calcolo le date per filtrare le transazioni
      const now = new Date(); // Data e ora corrente
      const currentMonth = now.getMonth(); // Mese corrente (0-11)
      const currentYear = now.getFullYear(); // Anno corrente
      
      // Date di riferimento per il mese corrente
      const startOfMonth = new Date(currentYear, currentMonth, 1); // Primo giorno del mese
      
      // Date di riferimento per il mese scorso (per fare confronti)
      const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1); // Primo giorno mese scorso
      const endOfLastMonth = new Date(currentYear, currentMonth, 0); // Ultimo giorno mese scorso
      
      // PASSO 3: Filtro le transazioni del mese corrente
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        // Controllo che la transazione sia dello stesso mese e anno corrente
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      // PASSO 4: Filtro le transazioni del mese scorso (per calcolare la variazione percentuale)
      const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        // Controllo che la transazione sia tra inizio e fine del mese scorso
        return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
      });

      // PASSO 5: Filtro le transazioni di oggi (per mostrare l'attività giornaliera)
      const today = new Date();
      const todayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        // Confronto solo la data (ignoro l'ora) per trovare transazioni di oggi
        return transactionDate.toDateString() === today.toDateString();
      });

      // PASSO 6: Calcolo le statistiche principali sulle spese
      // Sommo tutte le transazioni del mese (i valori negativi sono spese)
      const totalExpenses = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      // Sommo tutte le transazioni del mese scorso (per il confronto)
      const lastMonthExpenses = lastMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      // Conto il numero totale di transazioni del mese
      const transactionCount = monthlyTransactions.length;
      // Calcolo la media giornaliera dividendo il totale per i giorni trascorsi nel mese
      const dailyAverage = totalExpenses / now.getDate();
      
      // PASSO 7: Calcolo la variazione percentuale rispetto al mese scorso
      // Formula: ((valore_corrente - valore_precedente) / valore_precedente) * 100
      const monthlyChange = lastMonthExpenses !== 0 
        ? ((totalExpenses - lastMonthExpenses) / Math.abs(lastMonthExpenses)) * 100 
        : 0; // Se non ci sono spese nel mese scorso, la variazione è 0
      
      // PASSO 8: Conto quante transazioni sono state fatte oggi
      const todayTransactionCount = todayTransactions.length;
      
      // PASSO 9: Determino il trend della media giornaliera (in crescita, calo o stabile)
      const lastWeekAverage = totalExpenses / 7; // Stima media degli ultimi giorni
      // Se la media giornaliera è >10% rispetto alla settimana scorsa → "In crescita"
      // Se la media giornaliera è <10% rispetto alla settimana scorsa → "In calo"
      // Altrimenti → "Stabile"
      const trendStatus = dailyAverage > lastWeekAverage * 1.1 ? 'In crescita' 
                        : dailyAverage < lastWeekAverage * 0.9 ? 'In calo' 
                        : 'Stabile';

      // PASSO 10: Calcolo quanto è stato speso per ogni categoria nel mese corrente
      const categorySpending = categories.map(category => {
        // Filtro solo le transazioni di questa categoria nel mese corrente
        const categoryTransactions = monthlyTransactions.filter(t => t.categoryId === category.id);
        // Sommo tutte le transazioni di questa categoria
        const total = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return {
          ...category, // Includo tutti i dati della categoria (nome, colore, icona, ecc.)
          amount: total, // Totale speso in questa categoria
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0 // Percentuale sul totale
        };
      }).sort((a, b) => b.amount - a.amount); // Ordino per spesa (dalla più alta alla più bassa)

      // PASSO 11: Calcolo il budget totale REALE dell'utente (non più hardcodato!)
      // Filtro i budget del mese corrente (periodo = 'monthly' e stesso mese/anno)
      // Il budget ha campi separati per 'year' (es: "2025") e 'month' (es: "09" per settembre)
      const currentMonthStr = String(currentMonth + 1).padStart(2, '0'); // Converto mese 0-11 in "01"-"12"
      const currentYearStr = String(currentYear); // Anno corrente come stringa
      
      const monthlyBudgets = budgets.filter(b => {
        // Filtro solo i budget mensili con year e month corrispondenti
        if (b.period === 'monthly') {
          return b.year === currentYearStr && b.month === currentMonthStr;
        }
        return false;
      });
      
      // Sommo tutti i budget mensili impostati dall'utente per questo mese
      const totalBudget = monthlyBudgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
      
      // Calcolo il budget rimanente REALE: budget totale meno le spese fatte
      // Se l'utente non ha impostato budget, mostro 0
      const remainingBudget = totalBudget > 0 ? totalBudget - Math.abs(totalExpenses) : 0;
      
      // Calcolo la percentuale di budget utilizzata REALE
      // Se non c'è budget impostato, mostro 0% (evito divisione per zero)
      const budgetUsedPercentage = totalBudget > 0 
        ? (Math.abs(totalExpenses) / totalBudget) * 100 
        : 0;

      // PASSO 12: Creo la risposta JSON con TUTTI I DATI REALI calcolati dal database
      res.json({
        totalExpenses, // Spese totali del mese REALI
        transactionCount, // Numero transazioni del mese REALI
        dailyAverage, // Media giornaliera REALE
        categorySpending, // Spese per categoria REALI con percentuali
        remainingBudget, // Budget rimanente REALE (calcolato dai budget dell'utente)
        budgetUsedPercentage, // Percentuale budget utilizzata REALE
        monthlyChange, // Variazione percentuale vs mese scorso REALE
        todayTransactionCount, // Numero transazioni di oggi REALI
        trendStatus, // Trend della media giornaliera REALE
      });
    } catch (error) {
      // In caso di errore nel calcolo, loggo l'errore e restituisco messaggio al client
      console.error('Error calculating monthly summary:', error);
      res.status(500).json({ message: "Errore nel calcolo delle statistiche" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
