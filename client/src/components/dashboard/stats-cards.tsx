import { formatCurrency } from "@/lib/constants";

// Interfaccia TypeScript che definisce quali dati ricevere dal componente padre
interface StatsCardsProps {
  monthlyExpenses: number; // Spese totali del mese corrente
  remainingBudget: number; // Budget rimanente per il mese
  budgetUsedPercentage: number; // Percentuale del budget già utilizzata
  transactionCount: number; // Numero totale di transazioni nel mese
  dailyAverage: number; // Media delle spese giornaliere
  // Nuove proprietà per dati dinamici invece di valori hardcodati
  monthlyChange: number; // Variazione percentuale rispetto al mese scorso
  todayTransactionCount: number; // Numero di transazioni effettuate oggi
  trendStatus: string; // Trend della spesa media ('In crescita', 'In calo', 'Stabile')
}

// Componente React che mostra le statistiche principali nella dashboard
export default function StatsCards({
  monthlyExpenses, // Spese del mese
  remainingBudget, // Budget rimanente
  budgetUsedPercentage, // Percentuale budget usata
  transactionCount, // Numero transazioni
  dailyAverage, // Media giornaliera
  monthlyChange, // Variazione mensile (nuovo!)
  todayTransactionCount, // Transazioni oggi (nuovo!)
  trendStatus // Trend spesa media (nuovo!)
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
          {/* Mostro la variazione percentuale dinamica rispetto al mese scorso */}
          <span className={`text-xs px-2 py-1 rounded-full ${
            (monthlyChange || 0) > 0 
              ? 'bg-red-100 text-red-800' // Rosso se le spese sono aumentate
              : (monthlyChange || 0) < 0 
              ? 'bg-green-100 text-green-800' // Verde se le spese sono diminuite
              : 'bg-slate-100 text-slate-600' // Grigio se sono uguali
          }`}>
            {(monthlyChange || 0) > 0 ? '+' : ''}{(monthlyChange || 0).toFixed(1)}%
          </span>
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
          {/* Mostro il numero reale di transazioni effettuate oggi */}
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {(todayTransactionCount || 0) > 0 ? '+' : ''}{todayTransactionCount || 0}
          </span>
          <span className="text-xs text-slate-500">
            {(todayTransactionCount || 0) === 1 ? 'nuova oggi' : 'nuove oggi'}
          </span>
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
          {/* Mostro il trend dinamico della media giornaliera */}
          <span className={`text-xs px-2 py-1 rounded-full ${
            (trendStatus || 'Stabile') === 'In crescita' 
              ? 'bg-red-100 text-red-600' // Rosso per trend in crescita (più spese)
              : (trendStatus || 'Stabile') === 'In calo' 
              ? 'bg-green-100 text-green-600' // Verde per trend in calo (meno spese)
              : 'bg-slate-100 text-slate-600' // Grigio per trend stabile
          }`}>
            {trendStatus || 'Stabile'}
          </span>
        </div>
      </div>
    </div>
  );
}
