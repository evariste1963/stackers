import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { getDb } from './stackStorage';
import { savePrice, type GoldPriceData } from './priceService';
import { saveToHistory, type HistoryEntry } from './historyService';

let settingsDb: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initSettingsTables(): Promise<SQLite.SQLiteDatabase> {
  if (settingsDb) return settingsDb;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const database = await getDb();
      settingsDb = database;
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          currency TEXT DEFAULT 'GBP',
          unit TEXT DEFAULT 'toz',
          hasApiKey INTEGER DEFAULT 0,
          createdAt TEXT,
          updatedAt TEXT
        );
      `);
      
      const existingSettings = await database.getFirstAsync('SELECT id FROM user_settings WHERE id = 1');
      if (!existingSettings) {
        const now = new Date().toISOString();
        await database.runAsync(
          'INSERT INTO user_settings (id, currency, unit, hasApiKey, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [1, 'GBP', 'toz', 0, now, now]
        );
      }
      
      return database;
    } catch (error) {
      console.error('Error initializing settings tables:', error);
      initPromise = null;
      throw error;
    }
  })();
  
  return initPromise;
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
    const database = await initSettingsTables();
    const rows = await database.getAllAsync(
      'SELECT * FROM user_settings WHERE id = 1'
    ) as any[];
    
    if (rows.length > 0) {
      const row = rows[0];
      return {
        currency: row.currency,
        unit: row.unit,
        hasApiKey: Boolean(row.hasApiKey),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }
    return { ...DEFAULT_USER_SETTINGS };
  } catch (error) {
    console.error('Error reading user settings:', error);
    return { ...DEFAULT_USER_SETTINGS };
  }
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    const database = await initSettingsTables();
    await database.runAsync(`
      INSERT OR REPLACE INTO user_settings 
      (id, currency, unit, hasApiKey, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      1,
      settings.currency,
      settings.unit,
      settings.hasApiKey ? 1 : 0,
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
    
    const database = await initSettingsTables();
    const now = new Date().toISOString();
    
    const existing = await database.getFirstAsync('SELECT id FROM user_settings WHERE id = 1');
    
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
    
    const database = await initSettingsTables();
    await database.runAsync(
      'UPDATE user_settings SET hasApiKey = 0, updatedAt = ? WHERE id = 1',
      [new Date().toISOString()]
    );
  } catch (error) {
    console.error('Error removing API key:', error);
    throw error;
  }
}

export async function updatePreference(key: 'currency' | 'unit', value: string): Promise<void> {
  try {
    const database = await initSettingsTables();
    await database.runAsync(
      `UPDATE user_settings SET ${key} = ?, updatedAt = ? WHERE id = 1`,
      [value, new Date().toISOString()]
    );
  } catch (error) {
    console.error('Error updating preference:', error);
    throw error;
  }
}

export async function clearUserSettings(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('gold_api_key');
    const database = await initSettingsTables();
    await database.runAsync('DELETE FROM user_settings WHERE id = 1');
  } catch (error) {
    console.error('Error clearing user settings:', error);
    throw error;
  }
}

export async function hasApiKey(): Promise<boolean> {
  try {
    const database = await initSettingsTables();
    const rows = await database.getAllAsync(
      'SELECT hasApiKey FROM user_settings WHERE id = 1'
    ) as any[];
    if (rows.length > 0) {
      return Boolean(rows[0].hasApiKey);
    }
    return false;
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
      const price = JSON.parse(priceData) as GoldPriceData;
      await savePrice(price);
    }
    
    const historyData = await Storage.getItemAsync('gold_price_history');
    if (historyData) {
      const history = JSON.parse(historyData) as HistoryEntry[];
      const database = await initSettingsTables();
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