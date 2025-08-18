import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Category, Account } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportedTransaction {
  date: string;
  description: string;
  amount: string;
  categoryId: string;
  accountId: string;
}

export default function ImportExpensesModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportedTransaction[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
    defaultCategoryId: '',
    defaultAccountId: ''
  });
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const importMutation = useMutation({
    mutationFn: async (transactions: ImportedTransaction[]) => {
      const promises = transactions.map(transaction => 
        fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...transaction,
            amount: parseFloat(transaction.amount)
          })
        }).then(res => {
          if (!res.ok) throw new Error('Errore nell\'importazione');
          return res.json();
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly-summary"] });
      toast({
        title: "Importazione completata",
        description: `${preview.length} transazioni importate con successo.`,
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante l'importazione delle transazioni.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setCsvHeaders([]);
    setMapping({
      dateColumn: '',
      descriptionColumn: '',
      amountColumn: '',
      defaultCategoryId: '',
      defaultAccountId: ''
    });
    setStep('upload');
  };

  const parseCSVFile = (csvContent: string): string[][] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast({
        title: "Formato non supportato",
        description: "Per favore seleziona un file CSV.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = async (file: File) => {
    try {
      const content = await file.text();
      const rows = parseCSVFile(content);
      
      if (rows.length > 0) {
        setCsvHeaders(rows[0]);
        setStep('mapping');
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella lettura del file CSV.",
        variant: "destructive",
      });
    }
  };

  const generatePreview = async () => {
    if (!file) return;
    
    try {
      const content = await file.text();
      const rows = parseCSVFile(content);
      
      if (rows.length < 2) {
        toast({
          title: "Errore",
          description: "Il file deve contenere almeno una riga di intestazioni e una di dati.",
          variant: "destructive",
        });
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      // Trova gli indici delle colonne mappate
      const dateIndex = headers.findIndex(h => h.toLowerCase() === mapping.dateColumn.toLowerCase());
      const descIndex = headers.findIndex(h => h.toLowerCase() === mapping.descriptionColumn.toLowerCase());
      const amountIndex = headers.findIndex(h => h.toLowerCase() === mapping.amountColumn.toLowerCase());

      if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
        toast({
          title: "Errore",
          description: "Verifica che tutte le colonne siano mappate correttamente.",
          variant: "destructive",
        });
        return;
      }

      const transactions: ImportedTransaction[] = dataRows.map((row, index) => {
        let dateStr = row[dateIndex] || '';
        let amount = row[amountIndex] || '0';
        
        // Pulisci e converti l'importo
        amount = amount.replace(/[€$£¥,\s]/g, '').replace(',', '.');
        
        // Converti la data in formato ISO
        let isoDate = '';
        try {
          // Prova diversi formati di data
          const dateParts = dateStr.split(/[\/\-\.]/);
          if (dateParts.length === 3) {
            // Supponi dd/mm/yyyy o dd-mm-yyyy
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            isoDate = `${year}-${month}-${day}`;
          } else {
            isoDate = new Date().toISOString().split('T')[0];
          }
        } catch {
          isoDate = new Date().toISOString().split('T')[0];
        }

        return {
          date: isoDate,
          description: row[descIndex] || `Transazione ${index + 1}`,
          amount: parseFloat(amount) < 0 ? amount : `-${Math.abs(parseFloat(amount))}`,
          categoryId: mapping.defaultCategoryId,
          accountId: mapping.defaultAccountId
        };
      }).filter(t => t.description && !isNaN(parseFloat(t.amount)));

      setPreview(transactions);
      setStep('preview');
      
      toast({
        title: "Preview generata",
        description: `${transactions.length} transazioni pronte per l'importazione.`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella lettura del file CSV. Verifica il formato.",
        variant: "destructive",
      });
    }
  };

  const canGeneratePreview = mapping.dateColumn && mapping.descriptionColumn && 
                           mapping.amountColumn && mapping.defaultCategoryId && 
                           mapping.defaultAccountId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-import-expenses">
          <Upload className="h-4 w-4 mr-2" />
          Importa Spese
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importa Spese da CSV</DialogTitle>
          <DialogDescription>
            Carica un file CSV e mappa le colonne per importare le tue transazioni.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="csv-file" className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Clicca per caricare un file CSV
                  </span>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-csv-file"
                  />
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Solo file CSV sono supportati
                </p>
              </div>
            </div>

            {file && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  File caricato: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-column">Colonna Data</Label>
                <Select value={mapping.dateColumn} onValueChange={(value) => setMapping({...mapping, dateColumn: value})}>
                  <SelectTrigger data-testid="select-date-column">
                    <SelectValue placeholder="Seleziona colonna data" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description-column">Colonna Descrizione</Label>
                <Select value={mapping.descriptionColumn} onValueChange={(value) => setMapping({...mapping, descriptionColumn: value})}>
                  <SelectTrigger data-testid="select-description-column">
                    <SelectValue placeholder="Seleziona colonna descrizione" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount-column">Colonna Importo</Label>
                <Select value={mapping.amountColumn} onValueChange={(value) => setMapping({...mapping, amountColumn: value})}>
                  <SelectTrigger data-testid="select-amount-column">
                    <SelectValue placeholder="Seleziona colonna importo" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="default-category">Categoria Predefinita</Label>
                <Select value={mapping.defaultCategoryId} onValueChange={(value) => setMapping({...mapping, defaultCategoryId: value})}>
                  <SelectTrigger data-testid="select-default-category">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="default-account">Conto Predefinito</Label>
              <Select value={mapping.defaultAccountId} onValueChange={(value) => setMapping({...mapping, defaultAccountId: value})}>
                <SelectTrigger data-testid="select-default-account">
                  <SelectValue placeholder="Seleziona conto" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Descrizione</th>
                    <th className="p-2 text-right">Importo</th>
                    <th className="p-2 text-left">Categoria</th>
                    <th className="p-2 text-left">Conto</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((transaction, index) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    const account = accounts.find(a => a.id === transaction.accountId);
                    return (
                      <tr key={index} className="border-t">
                        <td className="p-2">{new Date(transaction.date).toLocaleDateString('it-IT')}</td>
                        <td className="p-2">{transaction.description}</td>
                        <td className="p-2 text-right font-mono">€{Math.abs(parseFloat(transaction.amount)).toFixed(2)}</td>
                        <td className="p-2">{category?.name}</td>
                        <td className="p-2">{account?.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {preview.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                Mostrate le prime 10 di {preview.length} transazioni
              </p>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {preview.length} transazioni pronte per l'importazione.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Annulla
            </Button>
          )}

          {step === 'mapping' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('upload')}
                data-testid="button-back"
              >
                Indietro
              </Button>
              <Button 
                onClick={generatePreview}
                disabled={!canGeneratePreview}
                data-testid="button-generate-preview"
              >
                Genera Preview
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('mapping')}
                data-testid="button-back-to-mapping"
              >
                Modifica Mappatura
              </Button>
              <Button 
                onClick={() => importMutation.mutate(preview)}
                disabled={importMutation.isPending}
                data-testid="button-import"
              >
                {importMutation.isPending ? 'Importazione...' : `Importa ${preview.length} Transazioni`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}