import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Account } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, ACCOUNT_TYPES } from "@/lib/constants";

export default function Accounts() {
  const { toast } = useToast();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const handleDeleteAccount = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/accounts/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Successo",
        description: "Conto eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del conto",
        variant: "destructive",
      });
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return 'fas fa-university';
      case 'credit': return 'fas fa-credit-card';
      case 'debit': return 'fas fa-money-check-alt';
      case 'cash': return 'fas fa-money-bill-wave';
      default: return 'fas fa-wallet';
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return '#3B82F6';
      case 'credit': return '#EF4444';
      case 'debit': return '#10B981';
      case 'cash': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-slate-600">Caricamento conti...</p>
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Conti Bancari</h1>
              <p className="text-sm text-slate-500">Gestisci i tuoi conti e carte</p>
            </div>
            
            <Button className="bg-primary-600 text-white hover:bg-primary-700" data-testid="button-add-account">
              <i className="fas fa-plus mr-2" />
              Nuovo Conto
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        {/* Total Balance Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Saldo Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900" data-testid="text-total-balance">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-sm text-slate-500">Somma di tutti i conti</p>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const icon = getAccountIcon(account.type);
            const color = getAccountColor(account.type);
            const balance = parseFloat(account.balance);
            
            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow" data-testid={`account-card-${account.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <i className={icon} style={{ color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <Badge variant="secondary">
                          {ACCOUNT_TYPES[account.type as keyof typeof ACCOUNT_TYPES]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} data-testid={`balance-${account.id}`}>
                      {formatCurrency(balance)}
                    </p>
                    <p className="text-sm text-slate-500">Saldo attuale</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" data-testid={`button-edit-${account.id}`}>
                      <i className="fas fa-edit mr-1" />
                      Modifica
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-delete-${account.id}`}
                    >
                      <i className="fas fa-trash mr-1" />
                      Elimina
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-university text-4xl text-slate-300 mb-4"></i>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nessun conto configurato</h3>
            <p className="text-slate-500 mb-4">Aggiungi i tuoi conti bancari e carte per iniziare</p>
            <Button className="bg-primary-600 text-white hover:bg-primary-700">
              <i className="fas fa-plus mr-2" />
              Aggiungi Primo Conto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
