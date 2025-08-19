// Importo le funzioni necessarie per gestire le chiamate API e il caching
import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Funzione helper per gestire errori HTTP
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Estraggo il messaggio di errore dalla risposta
    const text = (await res.text()) || res.statusText;
    // Lancio un errore con status code e messaggio
    throw new Error(`${res.status}: ${text}`);
  }
}

// Funzione per fare chiamate API dirette (utilizzata per POST, PUT, DELETE)
export async function apiRequest(
  method: string, // Metodo HTTP (GET, POST, PUT, DELETE)
  url: string, // URL dell'endpoint API
  data?: unknown | undefined, // Dati da inviare nel body (per POST/PUT)
): Promise<Response> {
  // Faccio la chiamata HTTP con fetch
  const res = await fetch(url, {
    method,
    // Imposto header Content-Type solo se invio dati
    headers: data ? { "Content-Type": "application/json" } : {},
    // Converto i dati in JSON se presenti
    body: data ? JSON.stringify(data) : undefined,
    // Include i cookie per l'autenticazione
    credentials: "include",
  });

  // Controllo se la risposta è ok, altrimenti lancio errore
  await throwIfResNotOk(res);
  return res;
}

// Tipo per definire come gestire errori di autenticazione (401)
type UnauthorizedBehavior = "returnNull" | "throw";

// Funzione che crea una queryFn personalizzata per React Query
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior; // Come gestire errori 401 (non autenticato)
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Costruisco l'URL dalla queryKey (es: ["/api", "users"] diventa "/api/users")
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include", // Include cookie per autenticazione
    });

    // Se ricevo 401 e voglio ritornare null invece di errore
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Controllo errori e ritorno JSON
    await throwIfResNotOk(res);
    return await res.json();
  };

// Creo il client React Query con configurazioni personalizzate
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // Usa la funzione personalizzata, lancia errore su 401
      refetchInterval: false, // Non ricarica automaticamente a intervalli
      refetchOnWindowFocus: false, // Non ricarica quando la finestra torna in focus
      staleTime: Infinity, // I dati non diventano mai "stale" automaticamente
      retry: false, // Non riprova automaticamente se fallisce
    },
    mutations: {
      retry: false, // Non riprova le mutazioni se falliscono
    },
  },
});
