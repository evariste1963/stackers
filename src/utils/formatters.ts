import { AVAILABLE_UNITS } from '@/config';

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

export function getUnitAbbrev(code: string): string {
  return AVAILABLE_UNITS.find(u => u.code === code)?.abbrev ?? code;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

export function formatCurrency(price: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}