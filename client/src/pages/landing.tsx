import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CreditCard, PieChart, TrendingUp, Wallet, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Gestione Spese Personali
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Sostituisci Excel con una dashboard moderna e intelligente. 
            Monitora le tue spese, categorizza le transazioni e ottieni insights sui tuoi consumi.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/login'}
            data-testid="button-login"
          >
            <Shield className="mr-2 h-5 w-5" />
            Accedi per Iniziare
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Dashboard Interattiva</CardTitle>
              <CardDescription>
                Visualizza le tue spese con grafici intuitivi e analisi dettagliate per categoria
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Gestione Transazioni</CardTitle>
              <CardDescription>
                Aggiungi, modifica e categorizza le tue transazioni con facilità
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Conti Multipli</CardTitle>
              <CardDescription>
                Gestisci conto corrente, carte di credito, debito e contanti in un unico posto
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl">Budget Tracking</CardTitle>
              <CardDescription>
                Imposta budget mensili e monitora i tuoi progressi con barre di avanzamento
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <CardTitle className="text-xl">Analisi per Categoria</CardTitle>
              <CardDescription>
                Scopri dove spendi di più con grafici a torta e analisi dettagliate
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl">Sicurezza e Privacy</CardTitle>
              <CardDescription>
                I tuoi dati sono protetti con autenticazione sicura e crittografia avanzata
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-none shadow-lg bg-white dark:bg-slate-800">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Pronto a Iniziare?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sostituisci Excel con una soluzione moderna. Accedi ora per iniziare a monitorare le tue spese.
              </p>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                onClick={() => window.location.href = '/register'}
                data-testid="button-register-cta"
              >
                Registrati Ora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}