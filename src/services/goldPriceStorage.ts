import Storage from 'expo-sqlite/kv-store';
import * as SecureStore from 'expo-secure-store';
import { priceData as staticPriceData } from '../../assets/priceData.js';

const PRICE_KEY = 'gold_price_latest';
const HISTORY_KEY = 'gold_price_history';
const USER_SETTINGS_KEY = 'user_settings';

export interface GoldPriceData {
  price: number;
  ask: number;
  bid: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  date: string;
  currency: string;
  unit: string;
  fetchedAt: string;
}

export interface HistoryEntry {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function getLatestPrice(): Promise<GoldPriceData | null> {
  try {
    const data = await Storage.getItemAsync(PRICE_KEY);
    if (data) {
      return JSON.parse(data) as GoldPriceData;
    }
    return null;
  } catch (error) {
    console.error('Error reading gold price from storage:', error);
    return null;
  }
}

export async function savePrice(
  priceData: GoldPriceData
): Promise<GoldPriceData> {
  try {
    await Storage.setItemAsync(PRICE_KEY, JSON.stringify(priceData));
    return priceData;
  } catch (error) {
    console.error('Error saving gold price:', error);
    throw error;
  }
}

export async function saveSpotPrice(
  price: number,
  ask: number,
  bid: number,
  high: number,
  low: number,
  change: number,
  changePercent: number,
  currency: string = 'GBP',
  unit: string = 'toz'
): Promise<GoldPriceData> {
  const today = new Date().toISOString().split('T')[0];
  
  const priceData: GoldPriceData = {
    price,
    ask,
    bid,
    high,
    low,
    change,
    changePercent,
    date: today,
    currency,
    unit,
    fetchedAt: new Date().toISOString(),
  };

  return savePrice(priceData);
}

export async function clearPrice(): Promise<void> {
  try {
    await Storage.removeItemAsync(PRICE_KEY);
  } catch (error) {
    console.error('Error clearing gold price:', error);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const data = await Storage.getItemAsync(HISTORY_KEY);
    if (data) {
      return JSON.parse(data) as HistoryEntry[];
    }
    return [];
  } catch (error) {
    console.error('Error reading history from storage:', error);
    return [];
  }
}

export async function saveToHistory(
  price: number, 
  change: number = 0, 
  changePercent: number = 0,
  date?: string
): Promise<HistoryEntry> {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const entry: HistoryEntry = {
    date: targetDate,
    price,
    change,
    changePercent,
  };

  try {
    const history = await getHistory();
    
    const existingIndex = history.findIndex(h => h.date === targetDate);
    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.push(entry);
    }
    
    history.sort((a, b) => a.date.localeCompare(b.date));
    
    await Storage.setItemAsync(HISTORY_KEY, JSON.stringify(history));
    return entry;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}

export async function migrateStaticData(): Promise<void> {
  try {
    const existingHistory = await getHistory();
    if (existingHistory.length > 0) {
      return;
    }

    const staticEntries: HistoryEntry[] = Object.entries(staticPriceData).map(([date, price]) => ({
      date,
      price: typeof price === 'number' ? price : parseFloat(price as string),
    }));

    if (staticEntries.length > 0) {
      await Storage.setItemAsync(HISTORY_KEY, JSON.stringify(staticEntries));
      console.log('Migrated', staticEntries.length, 'static price entries to SQLite');
    }
  } catch (error) {
    console.error('Error migrating static data:', error);
  }
}

export async function getHistoryLength(): Promise<number> {
  const history = await getHistory();
  return history.length;
}

export interface UserSettings {
  currency: string;
  unit: string;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: 'GBP',
  unit: 'toz',
  hasApiKey: false,
  createdAt: '',
  updatedAt: '',
};

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const data = await Storage.getItemAsync(USER_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data) as UserSettings;
    }
    return { ...DEFAULT_USER_SETTINGS };
  } catch (error) {
    console.error('Error reading user settings:', error);
    return { ...DEFAULT_USER_SETTINGS };
  }
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    await Storage.setItemAsync(USER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
}

export async function updateApiKey(apiKey: string): Promise<void> {
  try {
    // Try SecureStore first
    try {
      await SecureStore.setItemAsync('gold_api_key', apiKey);
    } catch (secureError) {
      // Fallback: store in SQLite if SecureStore fails
      await Storage.setItemAsync('gold_api_key_fallback', apiKey);
    }
    
    const settings = await getUserSettings();
    settings.hasApiKey = true;
    settings.updatedAt = new Date().toISOString();
    await saveUserSettings(settings);
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    // Try SecureStore first
    try {
      const key = await SecureStore.getItemAsync('gold_api_key');
      if (key) {
        return key;
      }
    } catch (e) {
      // Fallback: check SQLite
    }
    
    // Fallback: check SQLite
    const fallbackKey = await Storage.getItemAsync('gold_api_key_fallback');
    if (fallbackKey) {
      return fallbackKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

export async function removeApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('gold_api_key');
    
    const settings = await getUserSettings();
    settings.hasApiKey = false;
    settings.updatedAt = new Date().toISOString();
    await saveUserSettings(settings);
  } catch (error) {
    console.error('Error removing API key:', error);
    throw error;
  }
}

export async function updatePreference(key: 'currency' | 'unit', value: string): Promise<void> {
  try {
    const settings = await getUserSettings();
    settings[key] = value;
    settings.updatedAt = new Date().toISOString();
    await saveUserSettings(settings);
  } catch (error) {
    console.error('Error updating preference:', error);
    throw error;
  }
}

export async function clearUserSettings(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('gold_api_key');
    await Storage.removeItemAsync(USER_SETTINGS_KEY);
  } catch (error) {
    console.error('Error clearing user settings:', error);
    throw error;
  }
}

export async function hasApiKey(): Promise<boolean> {
  const settings = await getUserSettings();
  return settings.hasApiKey;
}