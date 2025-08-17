export const CATEGORY_COLORS = {
  'Alimentari': '#EF4444',
  'Trasporti': '#3B82F6', 
  'Shopping': '#10B981',
  'Bollette': '#F59E0B',
  'Intrattenimento': '#8B5CF6',
  'Salute': '#EC4899',
  'Altro': '#6B7280',
};

export const CATEGORY_ICONS = {
  'Alimentari': 'fas fa-shopping-cart',
  'Trasporti': 'fas fa-bus',
  'Shopping': 'fas fa-shopping-bag', 
  'Bollette': 'fas fa-bolt',
  'Intrattenimento': 'fas fa-film',
  'Salute': 'fas fa-heartbeat',
  'Altro': 'fas fa-tag',
};

export const ACCOUNT_TYPES = {
  'checking': 'Conto Corrente',
  'credit': 'Carta di Credito',
  'debit': 'Carta di Debito', 
  'cash': 'Contanti',
};

export const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
};

export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatTime = (date: Date | string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};
