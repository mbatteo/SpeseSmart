import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Transaction, Category, Account, User } from "@shared/schema";
import StatsCards from "@/components/dashboard/stats-cards";
import CategoryChart from "@/components/dashboard/category-chart";
import TopCategories from "@/components/dashboard/top-categories";
import TransactionTable from "@/components/transactions/transaction-table";
import AddTransactionModal from "@/components/transactions/add-transaction-modal";
import ImportExpensesModal from "@/components/import/import-expenses-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth() as { user: User | null };

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // Query per ottenere le statistiche della dashboard con i nuovi dati dinamici
  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalExpenses: number; // Spese totali del mese
    remainingBudget: number; // Budget rimanente
    budgetUsedPercentage: number; // Percentuale budget utilizzata
    transactionCount: number; // Numero transazioni mensili
    dailyAverage: number; // Media giornaliera delle spese
    categorySpending: Array<{ // Spese per categoria
      id: string;
      name: string;
      color: string;
      icon: string;
      amount: number;
      percentage: number;
    }>;
    // Nuovi campi dinamici per sostituire dati hardcodati
    monthlyChange: number; // Variazione percentuale vs mese scorso
    todayTransactionCount: number; // Transazioni di oggi
    trendStatus: string; // Trend della media giornaliera ('In crescita', 'In calo', 'Stabile')
  }>({
    queryKey: ['/api/analytics/monthly-summary'],
  });

  const handleAddTransaction = async (data: any) => {
    try {
      await apiRequest("POST", "/api/transactions", data);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/monthly-summary'] });
      toast({
        title: "Successo",
        description: "Transazione aggiunta con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della transazione",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // TODO: Implement edit modal
    console.log("Edit transaction:", transaction);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/transactions/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/monthly-summary'] });
      toast({
        title: "Successo",
        description: "Transazione eliminata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della transazione",
        variant: "destructive",
      });
    }
  };

  const isLoading = transactionsLoading || categoriesLoading || accountsLoading || analyticsLoading;

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

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-right">
                    <p className="font-medium text-slate-900">
                      Ciao, {user.firstName || user.email?.split('@')[0] || 'Utente'}!
                    </p>
                    <p className="text-slate-500">Benvenuto nella tua dashboard</p>
                  </div>
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              )}
              
              <ImportExpensesModal />
              
              <AddTransactionModal
                categories={categories}
                accounts={accounts}
                onSubmit={handleAddTransaction}
              />
              
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

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 lg:pb-6">
        {/* Carte delle statistiche con dati dinamici dal server */}
        {analytics && (
          <StatsCards
            monthlyExpenses={analytics.totalExpenses || 0}
            remainingBudget={analytics.remainingBudget || 0}
            budgetUsedPercentage={analytics.budgetUsedPercentage || 0}
            transactionCount={analytics.transactionCount || 0}
            dailyAverage={analytics.dailyAverage || 0}
            // Passo i nuovi dati dinamici per sostituire quelli hardcodati
            monthlyChange={analytics.monthlyChange || 0}
            todayTransactionCount={analytics.todayTransactionCount || 0}
            trendStatus={analytics.trendStatus || 'Stabile'}
          />
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {analytics?.categorySpending && (
            <CategoryChart data={analytics.categorySpending} />
          )}
          {analytics?.categorySpending && (
            <TopCategories categories={analytics.categorySpending} />
          )}
        </div>

        {/* Recent Transactions */}
        <TransactionTable
          transactions={recentTransactions}
          categories={categories}
          accounts={accounts}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
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
