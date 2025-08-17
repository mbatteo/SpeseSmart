import { formatCurrency } from "@/lib/constants";

interface StatsCardsProps {
  monthlyExpenses: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  transactionCount: number;
  dailyAverage: number;
}

export default function StatsCards({
  monthlyExpenses,
  remainingBudget,
  budgetUsedPercentage,
  transactionCount,
  dailyAverage
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Spese del Mese</p>
            <p className="text-2xl font-bold text-slate-900" data-testid="text-monthly-expenses">
              {formatCurrency(monthlyExpenses)}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <i className="fas fa-arrow-down text-red-500"></i>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">+12.5%</span>
          <span className="text-xs text-slate-500">vs mese scorso</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Budget Rimanente</p>
            <p className="text-2xl font-bold text-emerald-600" data-testid="text-remaining-budget">
              {formatCurrency(remainingBudget)}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
            <i className="fas fa-piggy-bank text-emerald-500"></i>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span data-testid="text-budget-percentage">{budgetUsedPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full" 
              style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Transazioni Mese</p>
            <p className="text-2xl font-bold text-slate-900" data-testid="text-transaction-count">
              {transactionCount}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <i className="fas fa-list text-blue-500"></i>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">+8</span>
          <span className="text-xs text-slate-500">nuove oggi</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Media Giornaliera</p>
            <p className="text-2xl font-bold text-slate-900" data-testid="text-daily-average">
              {formatCurrency(dailyAverage)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
            <i className="fas fa-calendar-day text-purple-500"></i>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Stabile</span>
        </div>
      </div>
    </div>
  );
}
