import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// SCHEMA DI VALIDAZIONE: definisce le regole per i campi del form
const editCategorySchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"), // Nome categoria non vuoto
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Colore non valido"), // Hex color valido
  localizedName: z.string().optional(), // Nome localizzato opzionale
  icon: z.string().optional(), // Icona opzionale
});

type EditCategoryFormData = z.infer<typeof editCategorySchema>;

interface EditCategoryModalProps {
  category: Category; // La categoria da modificare
  open: boolean; // Se il modal è aperto
  onOpenChange: (open: boolean) => void; // Callback per aprire/chiudere modal
  onSubmit: (data: { name: string; color: string; localizedName?: string; alias?: string[]; icon?: string }) => Promise<void>; // Callback per salvare
}

export default function EditCategoryModal({ 
  category, 
  open, 
  onOpenChange, 
  onSubmit 
}: EditCategoryModalProps) {
  // STATO LOCALE: gestione degli alias come array di stringhe
  const [aliases, setAliases] = useState<string[]>(category.alias || []);
  const [newAlias, setNewAlias] = useState(""); // Input per nuovo alias
  const [isSubmitting, setIsSubmitting] = useState(false); // Stato caricamento

  // FORM SETUP: configurazione react-hook-form con validazione Zod
  const form = useForm<EditCategoryFormData>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: category.name,
      color: category.color,
      localizedName: category.localizedName || "",
      icon: category.icon || "fas fa-tag",
    },
  });

  // EFFETTO: Aggiorna i valori del form quando cambia la categoria
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color,
        localizedName: category.localizedName || "",
        icon: category.icon || "fas fa-tag",
      });
      setAliases(category.alias || []);
    }
  }, [category, form]);

  // FUNZIONE: Aggiunge un nuovo alias alla lista
  const handleAddAlias = () => {
    const trimmed = newAlias.trim();
    // Verifico che non sia vuoto e non sia già presente
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases([...aliases, trimmed]); // Aggiungo alla lista
      setNewAlias(""); // Resetto l'input
    }
  };

  // FUNZIONE: Rimuove un alias dalla lista
  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter(a => a !== aliasToRemove));
  };

  // FUNZIONE: Gestisce il submit del form
  const handleSubmit = async (data: EditCategoryFormData) => {
    setIsSubmitting(true);
    try {
      // Invio tutti i dati inclusi gli alias
      await onSubmit({
        ...data,
        alias: aliases, // Includo l'array degli alias
      });
      onOpenChange(false); // Chiudo il modal
    } catch (error) {
      console.error("Errore salvataggio categoria:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-edit-category">
        <DialogHeader>
          <DialogTitle>Modifica Categoria</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            {/* CAMPO: Nome della categoria */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es: Alimentari"
                      {...field}
                      data-testid="input-category-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CAMPO: Colore - Color Picker + Input Esadecimale sincronizzati */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colore</FormLabel>
                  <div className="flex space-x-2">
                    {/* Color picker nativo */}
                    <FormControl>
                      <input
                        type="color"
                        {...field}
                        className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                        data-testid="input-color-picker"
                      />
                    </FormControl>
                    {/* Input testo per hex code (sincronizzato) */}
                    <FormControl>
                      <Input
                        placeholder="#6B7280"
                        {...field}
                        onChange={(e) => {
                          // Converto in uppercase e aggiungo # se mancante
                          let value = e.target.value.toUpperCase();
                          if (value && !value.startsWith('#')) {
                            value = '#' + value;
                          }
                          field.onChange(value);
                        }}
                        className="flex-1"
                        data-testid="input-color-hex"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CAMPO: Nome Localizzato (traduzione inglese) */}
            <FormField
              control={form.control}
              name="localizedName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traduzione Inglese (opzionale)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es: Groceries"
                      {...field}
                      data-testid="input-localized-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SEZIONE: Gestione Alias come Tag */}
            <div className="space-y-2">
              <FormLabel>Alias / Nomi Alternativi</FormLabel>
              
              {/* Lista degli alias esistenti come badge/tag */}
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-slate-200 rounded-md">
                {aliases.length === 0 ? (
                  <span className="text-sm text-slate-400">Nessun alias aggiunto</span>
                ) : (
                  aliases.map((alias, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="flex items-center gap-1 px-2 py-1"
                      data-testid={`alias-tag-${index}`}
                    >
                      <span>{alias}</span>
                      {/* Pulsante per rimuovere l'alias */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAlias(alias)}
                        className="ml-1 hover:text-red-600"
                        data-testid={`button-remove-alias-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              {/* Input per aggiungere nuovo alias */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Aggiungi alias (es: supermercato, spesa)"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onKeyPress={(e) => {
                    // Permetto di aggiungere alias premendo Enter
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAlias();
                    }
                  }}
                  data-testid="input-new-alias"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAlias}
                  disabled={!newAlias.trim()}
                  data-testid="button-add-alias"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Gli alias aiutano a identificare la categoria durante l'import CSV
              </p>
            </div>

            {/* PULSANTI: Annulla e Salva */}
            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                data-testid="button-cancel-edit"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                disabled={isSubmitting}
                data-testid="button-save-edit"
              >
                {isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
