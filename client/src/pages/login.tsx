import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { localUserLoginSchema, type LocalUserLogin } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LocalUserLogin>({
    resolver: zodResolver(localUserLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LocalUserLogin) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/local/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Errore durante il login');
      }

      toast({
        title: "Login effettuato!",
        description: "Accesso completato con successo.",
      });

      // Redirect to dashboard
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante il login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Landing */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Homepage
            </Button>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Accedi al tuo Account
              </CardTitle>
              
            </CardHeader>

           <CardContent className="space-y-6">
             {/* Replit Auth Option */}
             
              <div className="space-y-4">
              {/* 
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-login-replit"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Accedi con Replit
                </Button>
              */}
                <div className="relative">
                 {/* linea separatore
                 <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  */}
                </div>
              </div>

              {/* Local Login Form */}
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
                              data-testid="input-email-login"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="La tua password"
                              className="pl-10"
                              data-testid="input-password-login"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-center">
                    <Link href="/forgot-password">
                      <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer" data-testid="link-forgot-password">
                        Password dimenticata?
                      </span>
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                  </Button>
                </form>
              </Form>

              {/* Link to Registration */}
              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Non hai un account?{" "}
                  <Link href="/register">
                    <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer" data-testid="link-register">
                      Registrati qui
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