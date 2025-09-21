import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPassword } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPassword) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Errore durante la richiesta');
      }

      setEmailSent(true);
      toast({
        title: "Richiesta inviata",
        description: result.message,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la richiesta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Email Inviata
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Controlla la tua casella email per le istruzioni
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Se esiste un account associato all'email, riceverai un'email con le istruzioni per reimpostare la password.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Il link di reset scadrà tra 1 ora per motivi di sicurezza.
                </p>
                
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full" data-testid="button-back-to-login">
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
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Password Dimenticata?
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Inserisci la tua email per ricevere le istruzioni di reset
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="tua@email.com"
                              className="pl-10"
                              data-testid="input-forgot-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                    data-testid="button-submit-forgot"
                  >
                    {isLoading ? "Invio in corso..." : "Invia Istruzioni"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Ricordi la password?{" "}
                  <Link href="/login">
                    <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer" data-testid="link-back-login">
                      Accedi qui
                    </span>
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}