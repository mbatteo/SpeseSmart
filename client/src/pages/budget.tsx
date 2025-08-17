import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/constants";

export default function Budget() {
  // Mock budget data - replace with real API calls
  const budgets = [
    { category: 'Alimentari', budget: 800, spent: 654, color: '#EF4444' },
    { category: 'Trasporti', budget: 300, spent: 245, color: '#3B82F6' },
    { category: 'Shopping', budget: 500, spent: 378, color: '#10B981' },
    { category: 'Bollette', budget: 400, spent: 324, color: '#F59E0B' },
    { category: 'Intrattenimento', budget: 200, spent: 145, color: '#8B5CF6' },
  ];

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Budget</h1>
              <p className="text-sm text-slate-500">Monitora i tuoi budget mensili</p>
            </div>
            
            <Button className="bg-primary-600 text-white hover:bg-primary-700" data-testid="button-add-budget">
              <i className="fas fa-plus mr-2" />
              Nuovo Budget
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        {/* Overall Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Budget Totale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(2200)}</p>
              <p className="text-sm text-slate-500">Budget mensile impostato</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Speso Finora</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(1746)}</p>
              <p className="text-sm text-slate-500">79.4% del budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Rimanente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(454)}</p>
              <p className="text-sm text-slate-500">20.6% disponibile</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Budget per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgets.map((budget, index) => {
                const percentage = (budget.spent / budget.budget) * 100;
                const remaining = budget.budget - budget.spent;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={index} className="space-y-3" data-testid={`budget-${budget.category}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: budget.color }}
                        />
                        <h4 className="font-medium text-slate-900">{budget.category}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                        </p>
                        <p className={`text-sm ${isOverBudget ? 'text-red-600' : remaining < budget.budget * 0.2 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                          {isOverBudget ? 'Superato' : `${formatCurrency(remaining)} rimanenti`}
                        </p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                      style={{
                        '--progress-background': isOverBudget ? '#EF4444' : percentage > 80 ? '#F59E0B' : budget.color
                      } as any}
                    />
                    
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{percentage.toFixed(1)}% utilizzato</span>
                      {isOverBudget && (
                        <span className="text-red-600 font-medium">
                          Eccedenza: {formatCurrency(budget.spent - budget.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
