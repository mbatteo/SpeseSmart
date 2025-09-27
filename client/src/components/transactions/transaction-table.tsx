import { useState } from "react";
import { formatCurrency, formatDate, formatTime, ACCOUNT_TYPES } from "@/lib/constants";
import { Transaction, Category, Account } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, XCircle, Edit, Trash2 } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onConfirmCategory?: (transactionId: string, categoryId: string) => void;
}

export default function TransactionTable({ 
  transactions, 
  categories, 
  accounts, 
  onEdit, 
  onDelete,
  onConfirmCategory
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategories, setEditingCategories] = useState<{[key: string]: string}>({});
  const itemsPerPage = 10;

  // Funzione per determinare lo stato di una transazione
  const getTransactionStatus = (transaction: Transaction) => {
    const category = getCategoryById(transaction.categoryId);
    const isUnclassified = category?.name === 'Non classificato';
    
    // Se è confermata manualmente → Verde (qualunque caso)
    if (transaction.confirmed) {
      return { status: 'confirmed', color: 'green', label: 'Confermata manualmente' };
    }
    
    // Se è importata da CSV
    if (transaction.importedCategoryRaw) {
      // Se ha fatto match esatto (categoria diversa da "Non classificato") → Giallo
      if (!isUnclassified) {
        return { status: 'preselected', color: 'yellow', label: 'Match da CSV - da confermare' };
      }
      // Se non ha fatto match (categoria è "Non classificato") → Rosso  
      else {
        return { status: 'missing', color: 'red', label: 'Nessun match CSV - rivedere categoria' };
      }
    }
    
    // Se creata manualmente ma non confermata (non dovrebbe succedere) → Verde
    if (!transaction.importedCategoryRaw) {
      return { status: 'confirmed', color: 'green', label: 'Creata manualmente' };
    }
    
    // Default: rosso
    return { status: 'missing', color: 'red', label: 'Categoria da verificare' };
  };

  // Funzione per gestire il cambio categoria
  const handleCategoryChange = (transactionId: string, newCategoryId: string) => {
    setEditingCategories(prev => ({
      ...prev,
      [transactionId]: newCategoryId
    }));
  };

  // Funzione per confermare la categoria
  const handleConfirmCategory = (transactionId: string, currentCategoryId: string) => {
    const newCategoryId = editingCategories[transactionId] || currentCategoryId;
    if (newCategoryId && onConfirmCategory) {
      onConfirmCategory(transactionId, newCategoryId);
      // Rimuovi dalla lista di editing
      setEditingCategories(prev => {
        const newState = { ...prev };
        delete newState[transactionId];
        return newState;
      });
    }
  };

  const getCategoryById = (id: string) => categories.find(c => c.id === id);
  const getAccountById = (id: string) => accounts.find(a => a.id === id);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || transaction.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Transazioni Recenti</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Visualizza Tutte
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              <Input
                type="text"
                placeholder="Cerca transazioni..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-transactions"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48" data-testid="select-category-filter">
              <SelectValue placeholder="Tutte le categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le categorie</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Descrizione</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="text-center py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Conto</th>
              <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Importo</th>
              <th className="text-center py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                const account = getAccountById(transaction.accountId);
                const status = getTransactionStatus(transaction);
                const isEditing = transaction.id in editingCategories;
                const currentCategoryId = isEditing ? editingCategories[transaction.id] : transaction.categoryId;
                
                return (
                  <TooltipProvider key={transaction.id}>
                    <tr className="hover:bg-slate-50" data-testid={`transaction-row-${transaction.id}`}>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        <div>
                          <p className="font-medium">{formatDate(transaction.date)}</p>
                          <p className="text-xs text-slate-500">{formatTime(transaction.date)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-slate-900">{transaction.description}</p>
                          <p className="text-xs text-slate-500">{account?.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          {/* Dropdown categoria editabile */}
                          <Select 
                            value={currentCategoryId || ""} 
                            onValueChange={(value) => handleCategoryChange(transaction.id, value)}
                            data-testid={`select-category-${transaction.id}`}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue 
                                placeholder={status.status === 'missing' ? "Seleziona una categoria" : "Categoria"} 
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center">
                                    <i className={`${cat.icon} mr-2`} style={{ color: cat.color }} />
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Badge "No preselezione" per casi rossi */}
                          {status.status === 'missing' && !transaction.importedCategoryRaw && (
                            <Badge variant="destructive" className="text-xs">
                              No preselezione
                            </Badge>
                          )}
                          
                          {/* Pulsante conferma quando c'è una modifica O quando la categoria è preselezionata */}
                          {(isEditing || status.status === 'preselected') && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmCategory(transaction.id, currentCategoryId)}
                              data-testid={`button-confirm-category-${transaction.id}`}
                              className="w-full"
                            >
                              Conferma
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {/* Pallino colorato per lo stato */}
                        <Tooltip>
                          <TooltipTrigger>
                            <div 
                              className="w-3 h-3 rounded-full mx-auto"
                              style={{
                                backgroundColor: 
                                  status.color === 'red' ? '#ef4444' :
                                  status.color === 'yellow' ? '#f59e0b' :
                                  '#10b981'
                              }}
                              aria-label={status.label}
                              data-testid={`status-${transaction.id}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{status.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {account && ACCOUNT_TYPES[account.type as keyof typeof ACCOUNT_TYPES]}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-semibold text-red-600" data-testid={`amount-${transaction.id}`}>
                          -{formatCurrency(parseFloat(transaction.amount))}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(transaction)}
                            data-testid={`button-edit-${transaction.id}`}
                            className="hover:bg-blue-50 p-2"
                          >
                            <Edit className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(transaction.id)}
                            data-testid={`button-delete-${transaction.id}`}
                            className="hover:bg-red-50 p-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </TooltipProvider>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  <div>
                    <i className="fas fa-receipt text-2xl mb-2"></i>
                    <p>Nessuna transazione trovata</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-700">
              Mostrando <span className="font-medium">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)}</span> di <span className="font-medium">{filteredTransactions.length}</span> transazioni
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                data-testid="button-previous-page"
              >
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Successiva
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
