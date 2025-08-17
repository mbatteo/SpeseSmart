import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Transaction, Category, Account } from "@shared/schema";
import StatsCards from "@/components/dashboard/stats-cards";
import CategoryChart from "@/components/dashboard/category-chart";
import TopCategories from "@/components/dashboard/top-categories";
import TransactionTable from "@/components/transactions/transaction-table";
import AddTransactionModal from "@/components/transactions/add-transaction-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalExpenses: number;
    remainingBudget: number;
    budgetUsedPercentage: number;
    transactionCount: number;
    dailyAverage: number;
    categorySpending: Array<{
      id: string;
      name: string;
      color: string;
      icon: string;
      amount: number;
      percentage: number;
    }>;
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
              <div className="flex items-center space-x-2 text-sm text-emerald-600">
                <i className="fas fa-sync-alt"></i>
                <span>Aggiornato ora</span>
              </div>
              
              <AddTransactionModal
                categories={categories}
                accounts={accounts}
                onSubmit={handleAddTransaction}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 lg:pb-6">
        {/* Stats Cards */}
        {analytics && (
          <StatsCards
            monthlyExpenses={analytics.totalExpenses || 0}
            remainingBudget={analytics.remainingBudget || 0}
            budgetUsedPercentage={analytics.budgetUsedPercentage || 0}
            transactionCount={analytics.transactionCount || 0}
            dailyAverage={analytics.dailyAverage || 0}
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
