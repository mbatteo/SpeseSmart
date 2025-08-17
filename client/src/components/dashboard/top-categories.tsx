import { formatCurrency } from "@/lib/constants";

interface CategoryData {
  id: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

interface TopCategoriesProps {
  categories: CategoryData[];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  const topCategories = categories
    .filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Categorie</h3>
      <div className="space-y-4">
        {topCategories.length > 0 ? (
          topCategories.map((category) => (
            <div key={category.id} className="flex items-center justify-between" data-testid={`category-${category.id}`}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-slate-700">{category.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900" data-testid={`amount-${category.id}`}>
                  {formatCurrency(category.amount)}
                </p>
                <p className="text-xs text-slate-500">
                  {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <i className="fas fa-tags text-2xl mb-2"></i>
            <p>Nessuna categoria con spese</p>
          </div>
        )}

        {topCategories.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <button 
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              data-testid="button-view-all-categories"
            >
              Visualizza Tutte le Categorie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
