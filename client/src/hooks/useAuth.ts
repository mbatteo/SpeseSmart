// Importo React Query per gestire le chiamate API
import { useQuery } from "@tanstack/react-query";

// Hook personalizzato per gestire l'autenticazione dell'utente
export function useAuth() {
  // Faccio una query per ottenere i dati dell'utente corrente
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"], // Chiave unica per identificare questa query
    retry: false, // Non riprovo automaticamente se fallisce (utente non autenticato)
  });

  // Ritorno le informazioni di autenticazione per i componenti
  return {
    user, // Dati dell'utente (nome, email, immagine profilo)
    isLoading, // Se sta ancora caricando i dati
    isAuthenticated: !!user, // true se l'utente è autenticato (ha dati), false altrimenti
  };
}