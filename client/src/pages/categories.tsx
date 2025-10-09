import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import EditCategoryModal from "@/components/categories/edit-category-modal";

export default function Categories() {
  const { toast } = useToast();
  
  // STATO: tracking della categoria in modifica e apertura modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // FUNZIONE: Gestisce l'eliminazione di una categoria
  const handleDeleteCategory = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/categories/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Successo",
        description: "Categoria eliminata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della categoria",
        variant: "destructive",
      });
    }
  };

  // FUNZIONE: Apre il modal di modifica per una categoria specifica
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  // FUNZIONE: Gestisce il salvataggio delle modifiche alla categoria
  const handleUpdateCategory = async (data: { 
    name: string; 
    color: string; 
    localizedName?: string; 
    alias?: string[];
    icon?: string;
  }) => {
    if (!editingCategory) return;

    try {
      // Invio richiesta PUT al backend per aggiornare la categoria
      await apiRequest("PUT", `/api/categories/${editingCategory.id}`, data);
      
      // Invalido la cache per ricaricare le categorie aggiornate
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      // Mostro notifica di successo
      toast({
        title: "Successo",
        description: "Categoria aggiornata con successo",
      });
    } catch (error) {
      // In caso di errore, mostro notifica
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della categoria",
        variant: "destructive",
      });
      throw error; // Rilancio per gestione nel modal
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-slate-600">Caricamento categorie...</p>
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
              <h1 className="text-2xl font-bold text-slate-900">Categorie</h1>
              <p className="text-sm text-slate-500">Gestisci le categorie delle tue spese</p>
            </div>
            
            <Button className="bg-primary-600 text-white hover:bg-primary-700" data-testid="button-add-category">
              <i className="fas fa-plus mr-2" />
              Nuova Categoria
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow" data-testid={`category-card-${category.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <i className={category.icon} style={{ color: category.color }} />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${category.color}20`, 
                      color: category.color,
                      border: `1px solid ${category.color}40`
                    }}
                  >
                    {category.color}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  {/* PULSANTE: Apre modal di modifica per questa categoria */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditClick(category)}
                    data-testid={`button-edit-${category.id}`}
                  >
                    <i className="fas fa-edit mr-1" />
                    Modifica
                  </Button>
                  {/* PULSANTE: Elimina la categoria */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`button-delete-${category.id}`}
                  >
                    <i className="fas fa-trash mr-1" />
                    Elimina
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-tags text-4xl text-slate-300 mb-4"></i>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nessuna categoria</h3>
            <p className="text-slate-500 mb-4">Inizia creando la tua prima categoria di spesa</p>
            <Button className="bg-primary-600 text-white hover:bg-primary-700">
              <i className="fas fa-plus mr-2" />
              Crea Prima Categoria
            </Button>
          </div>
        )}
      </div>

      {/* MODAL: Modifica categoria - appare quando editingCategory è valorizzato */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={handleUpdateCategory}
        />
      )}
    </div>
  );
}
