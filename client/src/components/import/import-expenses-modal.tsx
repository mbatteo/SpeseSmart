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
          body: JSON.stringify(transaction)
        }).then(res => res.json())
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
    setMapping({
      dateColumn: '',
      descriptionColumn: '',
      amountColumn: '',
      defaultCategoryId: '',
      defaultAccountId: ''
    });
    setStep('upload');
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

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Show mapping step
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const generatePreview = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const dateIndex = headers.indexOf(mapping.dateColumn);
      const descriptionIndex = headers.indexOf(mapping.descriptionColumn);
      const amountIndex = headers.indexOf(mapping.amountColumn);

      const transactions: ImportedTransaction[] = [];
      
      for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (row.length >= Math.max(dateIndex, descriptionIndex, amountIndex) + 1) {
          const date = new Date(row[dateIndex]).toISOString();
          const amount = Math.abs(parseFloat(row[amountIndex])).toString();
          
          transactions.push({
            date,
            description: row[descriptionIndex] || 'Transazione importata',
            amount,
            categoryId: mapping.defaultCategoryId,
            accountId: mapping.defaultAccountId
          });
        }
      }
      
      setPreview(transactions);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const dateIndex = headers.indexOf(mapping.dateColumn);
      const descriptionIndex = headers.indexOf(mapping.descriptionColumn);
      const amountIndex = headers.indexOf(mapping.amountColumn);

      const transactions: ImportedTransaction[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (row.length >= Math.max(dateIndex, descriptionIndex, amountIndex) + 1 && row[0]) {
          try {
            const date = new Date(row[dateIndex]).toISOString();
            const amount = Math.abs(parseFloat(row[amountIndex])).toString();
            
            transactions.push({
              date,
              description: row[descriptionIndex] || 'Transazione importata',
              amount,
              categoryId: mapping.defaultCategoryId,
              accountId: mapping.defaultAccountId
            });
          } catch (error) {
            console.warn('Riga saltata:', row);
          }
        }
      }
      
      importMutation.mutate(transactions);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-import-expenses">
          <Upload className="mr-2 h-4 w-4" />
          Importa Spese
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-import-expenses">
        <DialogHeader>
          <DialogTitle>Importa Spese da CSV</DialogTitle>
          <DialogDescription>
            Carica un file CSV per importare le tue transazioni. Il file deve contenere colonne per data, descrizione e importo.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">File CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                data-testid="input-csv-file"
              />
            </div>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Il file CSV deve avere intestazioni nella prima riga (es: Data, Descrizione, Importo).
                Formato data supportato: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'mapping' && file && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mappa le Colonne</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Colonna Data</Label>
                <Select value={mapping.dateColumn} onValueChange={(value) => setMapping({...mapping, dateColumn: value})}>
                  <SelectTrigger data-testid="select-date-column">
                    <SelectValue placeholder="Seleziona colonna data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Data">Data</SelectItem>
                    <SelectItem value="Date">Date</SelectItem>
                    <SelectItem value="data">data</SelectItem>
                    <SelectItem value="date">date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Colonna Descrizione</Label>
                <Select value={mapping.descriptionColumn} onValueChange={(value) => setMapping({...mapping, descriptionColumn: value})}>
                  <SelectTrigger data-testid="select-description-column">
                    <SelectValue placeholder="Seleziona colonna descrizione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Descrizione">Descrizione</SelectItem>
                    <SelectItem value="Description">Description</SelectItem>
                    <SelectItem value="descrizione">descrizione</SelectItem>
                    <SelectItem value="description">description</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Colonna Importo</Label>
                <Select value={mapping.amountColumn} onValueChange={(value) => setMapping({...mapping, amountColumn: value})}>
                  <SelectTrigger data-testid="select-amount-column">
                    <SelectValue placeholder="Seleziona colonna importo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Importo">Importo</SelectItem>
                    <SelectItem value="Amount">Amount</SelectItem>
                    <SelectItem value="importo">importo</SelectItem>
                    <SelectItem value="amount">amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria Predefinita</Label>
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
              <Label>Conto Predefinito</Label>
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

            <Button 
              onClick={generatePreview}
              disabled={!mapping.dateColumn || !mapping.descriptionColumn || !mapping.amountColumn || !mapping.defaultCategoryId || !mapping.defaultAccountId}
              data-testid="button-generate-preview"
            >
              Genera Anteprima
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Anteprima Importazione</h3>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Verranno importate le prime 5 transazioni mostrate qui sotto. Controlla che i dati siano corretti.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Descrizione</th>
                    <th className="p-2 text-left">Importo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((transaction, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{new Date(transaction.date).toLocaleDateString('it-IT')}</td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2">€{transaction.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button onClick={() => setOpen(false)} variant="outline">
              Annulla
            </Button>
          )}
          
          {step === 'mapping' && (
            <>
              <Button onClick={() => setStep('upload')} variant="outline">
                Indietro
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline">
                Annulla
              </Button>
            </>
          )}
          
          {step === 'preview' && (
            <>
              <Button onClick={() => setStep('mapping')} variant="outline">
                Indietro
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline">
                Annulla
              </Button>
              <Button 
                onClick={handleImport}
                disabled={importMutation.isPending}
                data-testid="button-confirm-import"
              >
                {importMutation.isPending ? "Importando..." : "Importa Transazioni"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}