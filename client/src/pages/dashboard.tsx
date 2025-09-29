// Importo le librerie necessarie per la dashboard
import { useQuery } from "@tanstack/react-query"; // Per fare le chiamate API al backend
import { queryClient } from "@/lib/queryClient"; // Client per gestire la cache delle query
import type { Transaction, Category, Account, User } from "@shared/schema"; // Tipi TypeScript condivisi
import StatsCards from "@/components/dashboard/stats-cards"; // Componente che mostra le 4 carte statistiche
import CategoryChart from "@/components/dashboard/category-chart"; // Componente grafico a torta delle categorie
import TopCategories from "@/components/dashboard/top-categories"; // Componente lista top 5 categorie
import TransactionTable from "@/components/transactions/transaction-table"; // Tabella transazioni recenti
import AddTransactionModal from "@/components/transactions/add-transaction-modal"; // Modale per creare nuova transazione
import ImportExpensesModal from "@/components/import/import-expenses-modal"; // Modale per importare CSV
import { useToast } from "@/hooks/use-toast"; // Hook per mostrare notifiche toast
import { useAuth } from "@/hooks/useAuth"; // Hook per ottenere l'utente autenticato
import { apiRequest } from "@/lib/queryClient"; // Funzione helper per chiamate API
import { Button } from "@/components/ui/button"; // Componente bottone UI
import { LogOut } from "lucide-react"; // Icona logout

// Componente principale della Dashboard - mostrato dopo il login
export default function Dashboard() {
  // Hook per mostrare notifiche all'utente (successo, errore, ecc.)
  const { toast } = useToast();
  
  // Ottengo i dati dell'utente autenticato
  const { user } = useAuth() as { user: User | null };

  // QUERY 1: Recupero tutte le transazioni dell'utente dal database
  // useQuery è "smart": fa la chiamata API automaticamente e gestisce loading/cache
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'], // Chiave univoca per identificare questa query nella cache
  });

  // QUERY 2: Recupero tutte le categorie dell'utente dal database
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // QUERY 3: Recupero tutti i conti dell'utente dal database
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // QUERY 4: Recupero le statistiche aggregate della dashboard
  // Questa query chiama l'endpoint /api/analytics/monthly-summary che calcola:
  // - Spese totali del mese
  // - Budget rimanente (REALE, non più hardcodato!)
  // - Percentuale budget utilizzata
  // - Numero transazioni
  // - Media giornaliera
  // - Spese per categoria con percentuali
  // - Variazione vs mese scorso
  // - Transazioni di oggi
  // - Trend spesa media
  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalExpenses: number; // Spese totali del mese REALI dal database
    remainingBudget: number; // Budget rimanente REALE (calcolato dai budget dell'utente)
    budgetUsedPercentage: number; // Percentuale budget utilizzata REALE
    transactionCount: number; // Numero transazioni mensili REALI
    dailyAverage: number; // Media giornaliera delle spese REALE
    categorySpending: Array<{ // Spese per categoria REALI
      id: string;
      name: string;
      color: string;
      icon: string;
      amount: number;
      percentage: number;
    }>;
    monthlyChange: number; // Variazione percentuale vs mese scorso REALE
    todayTransactionCount: number; // Transazioni di oggi REALI
    trendStatus: string; // Trend della media giornaliera REALE ('In crescita', 'In calo', 'Stabile')
  }>({
    queryKey: ['/api/analytics/monthly-summary'], // Chiave query per le statistiche
  });

  // FUNZIONE: Gestisce la creazione di una nuova transazione manuale
  // Chiamata quando l'utente clicca "Salva" nel modale "Crea Spesa"
  const handleAddTransaction = async (data: any) => {
    try {
      // IMPORTANTE: Le transazioni create manualmente sono SEMPRE confermate (puntino verde)
      // a differenza di quelle importate da CSV che richiedono conferma
      const transactionData = {
        ...data, // Dati dal form (amount, description, categoryId, accountId, date)
        confirmed: true, // Marcata come confermata (stato verde)
        importedCategoryRaw: null // Non è un import da CSV
      };
      
      // Invio la richiesta POST al backend per creare la transazione
      await apiRequest("POST", "/api/transactions", transactionData);
      
      // Invalido la cache per forzare il re-fetch dei dati aggiornati
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] }); // Ricarica lista transazioni
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/monthly-summary'] }); // Ricarica statistiche
      
      // Mostro notifica di successo all'utente
      toast({
        title: "Successo",
        description: "Transazione aggiunta con successo",
      });
    } catch (error) {
      // In caso di errore, mostro notifica di errore
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della transazione",
        variant: "destructive",
      });
    }
  };

  // FUNZIONE: Gestisce la modifica di una transazione esistente
  // TODO: Questa funzione sarà implementata in futuro con un modale di modifica
  const handleEditTransaction = (transaction: Transaction) => {
    console.log("Edit transaction:", transaction);
  };

  // FUNZIONE: Gestisce l'eliminazione di una transazione
  // Chiamata quando l'utente clicca il pulsante "Elimina" su una transazione
  const handleDeleteTransaction = async (id: string) => {
    try {
      // Invio richiesta DELETE al backend per eliminare la transazione
      await apiRequest("DELETE", `/api/transactions/${id}`);
      
      // Invalido la cache per aggiornare i dati visualizzati
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] }); // Aggiorna lista transazioni
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/monthly-summary'] }); // Aggiorna statistiche
      
      // Mostro notifica di successo
      toast({
        title: "Successo",
        description: "Transazione eliminata con successo",
      });
    } catch (error) {
      // In caso di errore, mostro notifica di errore
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della transazione",
        variant: "destructive",
      });
    }
  };

  // Determino se stiamo ancora caricando dati: se anche solo UNA query sta caricando, mostro lo spinner
  const isLoading = transactionsLoading || categoriesLoading || accountsLoading || analyticsLoading;

  // Se stiamo caricando i dati, mostro uno spinner invece della dashboard
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-slate-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  // Seleziono solo le 5 transazioni più recenti per mostrarle in homepage
  const recentTransactions = transactions.slice(0, 5);

  // RENDERING DELLA DASHBOARD
  return (
    <div>
      {/* HEADER: Barra superiore con titolo, data, utente e pulsanti azioni */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* SEZIONE SINISTRA: Titolo e data corrente */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                  {/* Mostro il mese e anno corrente in italiano (es: "settembre 2025") */}
                  {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            {/* SEZIONE DESTRA: Info utente e pulsanti azioni */}
            <div className="flex items-center space-x-4">
              {/* Mostro i dati dell'utente autenticato */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-right">
                    <p className="font-medium text-slate-900">
                      {/* Saluto personalizzato: uso nome, o email, o "Utente" come fallback */}
                      Ciao, {user.firstName || user.email?.split('@')[0] || 'Utente'}!
                    </p>
                    <p className="text-slate-500">Benvenuto nella tua dashboard</p>
                  </div>
                  {/* Se l'utente ha un'immagine profilo, la mostro */}
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              )}
              
              {/* PULSANTE: Importa spese da CSV */}
              <ImportExpensesModal />
              
              {/* PULSANTE: Crea nuova transazione manuale */}
              <AddTransactionModal
                categories={categories} // Passo le categorie disponibili
                accounts={accounts} // Passo i conti disponibili
                onSubmit={handleAddTransaction} // Funzione chiamata quando si salva
              />
              
              {/* PULSANTE: Logout */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* CORPO DELLA DASHBOARD: Tutte le sezioni principali */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 lg:pb-6">
        
        {/* SEZIONE 1: Le 4 carte delle statistiche principali */}
        {/* Mostro: Spese Mese, Budget Rimanente, Transazioni Mese, Media Giornaliera */}
        {/* TUTTI I DATI SONO REALI dal database (non più hardcodati!) */}
        {analytics && (
          <StatsCards
            monthlyExpenses={analytics.totalExpenses || 0} // Spese totali REALI
            remainingBudget={analytics.remainingBudget || 0} // Budget rimanente REALE (dai budget utente)
            budgetUsedPercentage={analytics.budgetUsedPercentage || 0} // % budget usata REALE
            transactionCount={analytics.transactionCount || 0} // N. transazioni REALI
            dailyAverage={analytics.dailyAverage || 0} // Media giornaliera REALE
            monthlyChange={analytics.monthlyChange || 0} // Variazione vs mese scorso REALE
            todayTransactionCount={analytics.todayTransactionCount || 0} // Transazioni oggi REALI
            trendStatus={analytics.trendStatus || 'Stabile'} // Trend spesa REALE
          />
        )}

        {/* SEZIONE 2: Grafici delle categorie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GRAFICO A TORTA: Mostra la distribuzione delle spese per categoria */}
          {analytics?.categorySpending && (
            <CategoryChart data={analytics.categorySpending} /> 
          )}
          {/* LISTA TOP 5: Mostra le 5 categorie con più spese */}
          {analytics?.categorySpending && (
            <TopCategories categories={analytics.categorySpending} />
          )}
        </div>

        {/* SEZIONE 3: Tabella delle transazioni recenti (ultime 5) */}
        <TransactionTable
          transactions={recentTransactions} // Solo le ultime 5 transazioni
          categories={categories} // Per mostrare i nomi delle categorie
          accounts={accounts} // Per mostrare i nomi dei conti
          onEdit={handleEditTransaction} // Funzione per modificare (TODO)
          onDelete={handleDeleteTransaction} // Funzione per eliminare
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <i className="fas fa-download text-primary-600"></i>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Esporta Dati</h4>
                <p className="text-sm text-slate-500">Scarica le tue transazioni in Excel</p>
              </div>
            </div>
            <button 
              className="mt-4 w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 font-medium"
              data-testid="button-export-data"
            >
              Esporta
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <i className="fas fa-university text-emerald-600"></i>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Sync Bancario</h4>
                <p className="text-sm text-slate-500">Sincronizza con le banche</p>
              </div>
            </div>
            <button 
              className="mt-4 w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 font-medium"
              data-testid="button-sync-banks"
            >
              Sincronizza
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-orange-600"></i>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Report Mensile</h4>
                <p className="text-sm text-slate-500">Genera report dettagliato</p>
              </div>
            </div>
            <button 
              className="mt-4 w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 font-medium"
              data-testid="button-generate-report"
            >
              Genera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
