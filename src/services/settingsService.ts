import * as SecureStore from 'expo-secure-store';
import { getDb } from './db';
import { saveGoldPrice, type MetalPriceData } from './metalPriceService';
import type { HistoryEntry } from './historyService';
import type { MetalType } from './stackStorage';

export interface UserSettings {
  currency: string;
  unit: string;
  hasApiKey: boolean;
  defaultMetal: MetalType;
  theme?: 'dark' | 'light';
  manualPrice?: number | null;
  manualHighPrice?: number | null;
  manualLowPrice?: number | null;
  previousManualPrice?: number | null;
  manualSilverPrice?: number | null;
  manualSilverHighPrice?: number | null;
  manualSilverLowPrice?: number | null;
  previousManualSilverPrice?: number | null;
  manualGoldPremium?: number | null;
  manualSilverPremium?: number | null;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: 'GBP',
  unit: 'toz',
  hasApiKey: false,
  defaultMetal: 'gold',
  theme: 'dark',
  manualPrice: null,
  createdAt: '',
  updatedAt: '',
};

interface SettingsRow {
  currency: string;
  unit: string;
  hasApiKey: number;
  defaultMetal: string;
  theme: string | null;
  manualPrice: number | null;
  manualHighPrice: number | null;
  manualLowPrice: number | null;
  previousManualPrice: number | null;
  manualSilverPrice: number | null;
  manualSilverHighPrice: number | null;
  manualSilverLowPrice: number | null;
  previousManualSilverPrice: number | null;
  manualGoldPremium: number | null;
  manualSilverPremium: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const database = await getDb();
    const row = await database.getFirstAsync<SettingsRow>('SELECT * FROM user_settings WHERE id = 1');
    
    if (row) {
      return mapRowToUserSettings(row);
    }
    return { ...DEFAULT_USER_SETTINGS };
  } catch (error) {
    console.error('Error reading user settings:', error);
    return { ...DEFAULT_USER_SETTINGS };
  }
}

function mapRowToUserSettings(row: SettingsRow): UserSettings {
  return {
    currency: row.currency,
    unit: row.unit,
    hasApiKey: Boolean(row.hasApiKey),
    defaultMetal: (row.defaultMetal || 'gold') as MetalType,
    theme: (row.theme as 'dark' | 'light') || 'dark',
    manualPrice: row.manualPrice,
    manualHighPrice: row.manualHighPrice,
    manualLowPrice: row.manualLowPrice,
    previousManualPrice: row.previousManualPrice,
    manualSilverPrice: row.manualSilverPrice,
    manualSilverHighPrice: row.manualSilverHighPrice,
    manualSilverLowPrice: row.manualSilverLowPrice,
    previousManualSilverPrice: row.previousManualSilverPrice,
    manualGoldPremium: row.manualGoldPremium,
    manualSilverPremium: row.manualSilverPremium,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync(`
      INSERT OR REPLACE INTO user_settings 
      (id, currency, unit, hasApiKey, defaultMetal, theme, manualPrice, manualHighPrice, manualLowPrice, previousManualPrice, manualSilverPrice, manualSilverHighPrice, manualSilverLowPrice, previousManualSilverPrice, manualGoldPremium, manualSilverPremium, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1,
      settings.currency,
      settings.unit,
      settings.hasApiKey ? 1 : 0,
      settings.defaultMetal || 'gold',
      settings.theme || 'dark',
      settings.manualPrice ?? null,
      settings.manualHighPrice ?? null,
      settings.manualLowPrice ?? null,
      settings.previousManualPrice ?? null,
      settings.manualSilverPrice ?? null,
      settings.manualSilverHighPrice ?? null,
      settings.manualSilverLowPrice ?? null,
      settings.previousManualSilverPrice ?? null,
      settings.manualGoldPremium ?? null,
      settings.manualSilverPremium ?? null,
      settings.createdAt || new Date().toISOString(),
      settings.updatedAt || new Date().toISOString(),
    ]);
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
}

export async function updateApiKey(apiKey: string): Promise<void> {
  try {
    await SecureStore.setItemAsync('gold_api_key', apiKey);
    
    const database = await getDb();
    const now = new Date().toISOString();
    
    const existing = await database.getFirstAsync<{ id: number }>('SELECT id FROM user_settings WHERE id = 1');
    
    if (existing) {
      await database.runAsync(
        'UPDATE user_settings SET hasApiKey = 1, updatedAt = ? WHERE id = 1',
        [now]
      );
    } else {
      await database.runAsync(
        'INSERT INTO user_settings (id, currency, unit, hasApiKey, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'GBP', 'toz', 1, now, now]
      );
    }
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    const key = await SecureStore.getItemAsync('gold_api_key');
    return key;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

export async function removeApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('gold_api_key');
    
    const database = await getDb();
    const existing = await database.getFirstAsync<{ id: number }>('SELECT id FROM user_settings WHERE id = 1');
    if (existing) {
      await database.runAsync(
        'UPDATE user_settings SET hasApiKey = 0, updatedAt = ? WHERE id = 1',
        [new Date().toISOString()]
      );
    }
  } catch (error) {
    console.error('Error removing API key:', error);
    throw error;
  }
}

export async function updatePreference(key: 'currency' | 'unit' | 'defaultMetal', value: string): Promise<void> {
  await updateUserSetting(key, value);
}

export async function getThemeSetting(): Promise<'dark' | 'light'> {
  try {
    const database = await getDb();
    const row = await database.getFirstAsync<{ theme: string | null }>('SELECT theme FROM user_settings WHERE id = 1');
    return (row?.theme as 'dark' | 'light') || 'dark';
  } catch {
    return 'dark';
  }
}

export async function updateThemeSetting(theme: 'dark' | 'light'): Promise<void> {
  await updateUserSetting('theme', theme);
}

async function updateUserSetting(column: string, value: unknown): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE user_settings SET ${column} = ?, updatedAt = ? WHERE id = 1`,
    [value as string | number | null, new Date().toISOString()]
  );
}

export async function updateManualPrice(price: number | null): Promise<void> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ manualPrice: number | null }>('SELECT manualPrice FROM user_settings WHERE id = 1');
  const previousPrice = row?.manualPrice ?? null;
  await updateUserSettingBatch([
    ['manualPrice', price],
    ['previousManualPrice', previousPrice],
  ]);
}

export async function updateManualHighLow(high: number, low: number): Promise<void> {
  await updateUserSettingBatch([
    ['manualHighPrice', high],
    ['manualLowPrice', low],
  ]);
}

export async function updateManualSilverPrice(price: number | null): Promise<void> {
  await updateUserSetting('manualSilverPrice', price);
}

export async function updateManualSilverHighLow(high: number, low: number): Promise<void> {
  await updateUserSettingBatch([
    ['manualSilverHighPrice', high],
    ['manualSilverLowPrice', low],
  ]);
}

export async function updateManualGoldPremium(premium: number | null): Promise<void> {
  await updateUserSetting('manualGoldPremium', premium);
}

export async function updateManualSilverPremium(premium: number | null): Promise<void> {
  await updateUserSetting('manualSilverPremium', premium);
}

async function updateUserSettingBatch(pairs: [string, unknown][]): Promise<void> {
  const database = await getDb();
  const now = new Date().toISOString();
  const setClause = pairs.map(([col]) => `${col} = ?`).join(', ');
  const values: (string | number | null)[] = [...pairs.map(([, val]) => val as string | number | null), now];
  await database.runAsync(
    `UPDATE user_settings SET ${setClause}, updatedAt = ? WHERE id = 1`,
    values
  );
}

export async function clearUserSettings(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('gold_api_key');
    const database = await getDb();
    await database.runAsync('DELETE FROM user_settings WHERE id = 1');
  } catch (error) {
    console.error('Error clearing user settings:', error);
    throw error;
  }
}

export async function hasApiKey(): Promise<boolean> {
  try {
    const key = await getApiKey();
    return !!key;
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
}

export async function migrateFromKVStore(): Promise<void> {
  try {
    const Storage = (await import('expo-sqlite/kv-store')).default;
    
    const migrationKey = await Storage.getItemAsync('migration_done');
    if (migrationKey) return;
    
    const settingsData = await Storage.getItemAsync('user_settings');
    if (settingsData) {
      const settings = JSON.parse(settingsData) as UserSettings;
      await saveUserSettings(settings);
    }
    
    const priceData = await Storage.getItemAsync('gold_price_latest');
    if (priceData) {
      const price = JSON.parse(priceData) as MetalPriceData;
      await saveGoldPrice(price);
    }
    
    const historyData = await Storage.getItemAsync('gold_price_history');
    if (historyData) {
      const history = JSON.parse(historyData) as HistoryEntry[];
      const database = await getDb();
      for (const entry of history) {
        await database.runAsync(`
          INSERT OR IGNORE INTO gold_price_history (date, price, change, changePercent)
          VALUES (?, ?, ?, ?)
        `, [entry.date, entry.price, entry.change, entry.changePercent]);
      }
    }
    
    await Storage.setItemAsync('migration_done', 'true');
    console.log('Migration from KV-store completed');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}