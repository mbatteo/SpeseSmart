import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from "@/lib/constants";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Mock data - replace with real API calls
  const monthlyData = [
    { month: 'Gen', expenses: 2245, income: 3000 },
    { month: 'Feb', expenses: 2156, income: 3000 },
    { month: 'Mar', expenses: 2678, income: 3000 },
    { month: 'Apr', expenses: 2334, income: 3000 },
    { month: 'Mag', expenses: 2789, income: 3000 },
    { month: 'Giu', expenses: 2456, income: 3000 },
  ];

  const categoryData = [
    { category: 'Alimentari', amount: 842, percentage: 29.5 },
    { category: 'Trasporti', amount: 654, percentage: 23.0 },
    { category: 'Shopping', amount: 438, percentage: 15.4 },
    { category: 'Bollette', amount: 325, percentage: 11.4 },
    { category: 'Intrattenimento', amount: 287, percentage: 10.1 },
  ];

  const handleExportReport = () => {
    // TODO: Implement report export
    console.log("Exporting report...");
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Report</h1>
              <p className="text-sm text-slate-500">Analisi dettagliate delle tue spese</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48" data-testid="select-report-period">
                  <SelectValue placeholder="Seleziona periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Ultimo mese</SelectItem>
                  <SelectItem value="quarter">Ultimo trimestre</SelectItem>
                  <SelectItem value="year">Ultimo anno</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleExportReport}
                className="bg-primary-600 text-white hover:bg-primary-700"
                data-testid="button-export-report"
              >
                <i className="fas fa-download mr-2" />
                Esporta Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Spese Totali</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(2847)}</p>
              <p className="text-xs text-slate-500">+12.5% vs periodo precedente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Entrate Totali</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(3000)}</p>
              <p className="text-xs text-slate-500">Stabili</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Saldo Netto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(153)}</p>
              <p className="text-xs text-slate-500">-15.2% vs periodo precedente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Tasso di Risparmio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">5.1%</p>
              <p className="text-xs text-slate-500">delle entrate totali</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Andamento Mensile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelStyle={{ color: '#1f2937' }}
                    />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Spese" />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Entrate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spese per Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Importo']}
                      labelStyle={{ color: '#1f2937' }}
                    />
                    <Bar dataKey="amount" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analisi Dettagliata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Categories */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Top Categorie di Spesa</h4>
                <div className="space-y-3">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{item.category}</span>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-slate-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spending Insights */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Insights & Raccomandazioni</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-amber-600 mt-1"></i>
                      <div>
                        <p className="font-medium text-amber-800">Spese alimentari elevate</p>
                        <p className="text-sm text-amber-700">Le spese per alimentari rappresentano il 29.5% del budget. Considera di pianificare i pasti.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <p className="font-medium text-green-800">Budget rispettato</p>
                        <p className="text-sm text-green-700">Sei riuscito a rimanere entro il budget per la categoria intrattenimento.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-lightbulb text-blue-600 mt-1"></i>
                      <div>
                        <p className="font-medium text-blue-800">Opportunità di risparmio</p>
                        <p className="text-sm text-blue-700">Riducendo le spese di trasporto del 10% potresti risparmiare €65 al mese.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
