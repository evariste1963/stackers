export const API_CONFIG = {
  metalsDevApiKey: '', // No longer used - stored in SQLite/SecureStore
};

export const STORAGE_KEYS = {
  goldPriceLatest: 'gold_price_latest',
  userSettings: 'user_settings',
};

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface UnitOption {
  code: string;
  name: string;
  abbrev: string;
}

export const AVAILABLE_CURRENCIES: CurrencyOption[] = [
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export const AVAILABLE_UNITS: UnitOption[] = [
  { code: 'toz', name: 'Troy Ounce', abbrev: 'oz' },
  { code: 'gram', name: 'Gram', abbrev: 'g' },
  { code: 'kg', name: 'Kilogram', abbrev: 'kg' },
];

export const METALS_DEV_URL = 'https://metals.dev/pricing';

export const DEFAULT_SETTINGS = {
  currency: 'GBP',
  unit: 'toz',
};