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
];

export const METALPRICE_API_URL = 'https://metalpriceapi.com';

export const DEFAULT_SETTINGS = {
  currency: 'GBP',
  unit: 'toz',
};
