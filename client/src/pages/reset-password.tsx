import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowLeft, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPassword } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ token?: string; email?: string }>({});
  const { toast } = useToast();

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // Extract token and email from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (token && email) {
      setTokenInfo({ token, email });
      form.setValue('token', token);
      form.setValue('email', email);
    } else {
      toast({
        title: "Link non valido",
        description: "Il link di reset è mancante o non valido. Richiedi nuovamente il reset.",
        variant: "destructive",
      });
    }
  }, [form, toast]);

  const onSubmit = async (data: ResetPassword) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Errore durante il reset della password');
      }

      setResetSuccess(true);
      toast({
        title: "Password reimpostata!",
        description: result.message,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante il reset della password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Password Reimpostata!
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  La tua password è stata aggiornata con successo
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Password reimpostata con successo. Tutte le sessioni attive sono state invalidate per sicurezza.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dovresti aver ricevuto un'email di conferma. Accedi ora con la nuova password.
                </p>
                
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-goto-login">
                      Vai al Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenInfo.token || !tokenInfo.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Link Non Valido
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Il link di reset è scaduto o non valido
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Il link per reimpostare la password è mancante, scaduto o non valido.
                </p>
                
                <div className="space-y-2">
                  <Link href="/forgot-password">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-request-new-reset">
                      Richiedi Nuovo Reset
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full" data-testid="button-back-login">
                      Torna al Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Login */}
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al Login
            </Button>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Reimposta Password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Inserisci la tua nuova password per l'account: {tokenInfo.email}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nuova Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Nuova password"
                              className="pl-10"
                              data-testid="input-new-password"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Almeno 8 caratteri
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conferma Nuova Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Conferma nuova password"
                              className="pl-10"
                              data-testid="input-confirm-new-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                    data-testid="button-submit-reset"
                  >
                    {isLoading ? "Aggiornamento..." : "Reimposta Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}