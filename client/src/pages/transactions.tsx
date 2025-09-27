import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Transaction, Category, Account } from "@shared/schema";
import TransactionTable from "@/components/transactions/transaction-table";
import AddTransactionModal from "@/components/transactions/add-transaction-modal";
import ImportExpensesModal from "@/components/import/import-expenses-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Transactions() {
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

  const handleAddTransaction = async (data: any) => {
    try {
      // Le transazioni create manualmente sono sempre confermate
      const transactionData = {
        ...data,
        confirmed: true,
        importedCategoryRaw: null // Non è un import
      };
      
      await apiRequest("POST", "/api/transactions", transactionData);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
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

  const handleConfirmCategory = async (transactionId: string, categoryId: string) => {
    try {
      await apiRequest("PUT", `/api/transactions/${transactionId}`, {
        categoryId,
        confirmed: true
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Successo",
        description: "Categoria confermata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella conferma della categoria",
        variant: "destructive",
      });
    }
  };

  const isLoading = transactionsLoading || categoriesLoading || accountsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-slate-600">Caricamento transazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Transazioni</h1>
              <p className="text-sm text-slate-500">Gestisci tutte le tue transazioni</p>
            </div>
            
            <div className="flex space-x-3">
              <AddTransactionModal
                categories={categories}
                accounts={accounts}
                onSubmit={handleAddTransaction}
              />
              <ImportExpensesModal />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        <TransactionTable
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onConfirmCategory={handleConfirmCategory}
        />
      </div>
    </div>
  );
}
