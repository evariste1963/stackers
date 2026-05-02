import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { getDb } from './stackStorage';
import { priceData as staticPriceData } from '../../assets/priceData.js';

// Remove kv-store dependency - migration handled by migrateFromKVStore()

let goldPriceDb: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initGoldPriceTables(): Promise<SQLite.SQLiteDatabase> {
  if (goldPriceDb) return goldPriceDb;
  
  // Prevent multiple simultaneous init calls
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const database = await getDb();
      goldPriceDb = database;
      
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
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS gold_price_latest (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          price REAL,
          ask REAL,
          bid REAL,
          high REAL,
          low REAL,
          change REAL,
          changePercent REAL,
          date TEXT,
          currency TEXT,
          unit TEXT,
          fetchedAt TEXT
        );
      `);
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS gold_price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          price REAL,
          change REAL,
          changePercent REAL
        );
      `);
      
      // Insert default user settings if not exists
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
      console.error('Error initializing gold price tables:', error);
      initPromise = null;
      throw error;
    }
  })();
  
  return initPromise;
}

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
    const database = await initGoldPriceTables();
    const rows = await database.getAllAsync(
      'SELECT * FROM gold_price_latest WHERE id = 1'
    ) as any[];
    
    if (rows.length > 0) {
      const row = rows[0];
      return {
        price: row.price,
        ask: row.ask,
        bid: row.bid,
        high: row.high,
        low: row.low,
        change: row.change,
        changePercent: row.changePercent,
        date: row.date,
        currency: row.currency,
        unit: row.unit,
        fetchedAt: row.fetchedAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error reading gold price:', error);
    return null;
  }
}

export async function savePrice(
  priceData: GoldPriceData
): Promise<GoldPriceData> {
  try {
    const database = await initGoldPriceTables();
    
    // Log what we're about to save
    console.log('Saving gold price:', JSON.stringify(priceData));
    
    await database.runAsync(`
      INSERT OR REPLACE INTO gold_price_latest
      (id, price, ask, bid, high, low, change, changePercent, date, currency, unit, fetchedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1,
      priceData.price ?? 0,
      priceData.ask ?? 0,
      priceData.bid ?? 0,
      priceData.high ?? 0,
      priceData.low ?? 0,
      priceData.change ?? 0,
      priceData.changePercent ?? 0,
      priceData.date,
      priceData.currency,
      priceData.unit,
      priceData.fetchedAt,
    ]);
    
    // Verify it was saved
    const saved = await database.getFirstAsync('SELECT * FROM gold_price_latest WHERE id = 1');
    console.log('Verified save:', saved);
    
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
    const database = await initGoldPriceTables();
    await database.runAsync('DELETE FROM gold_price_latest WHERE id = 1');
  } catch (error) {
    console.error('Error clearing gold price:', error);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const database = await initGoldPriceTables();
    const rows = await database.getAllAsync(
      'SELECT * FROM gold_price_history ORDER BY date ASC'
    ) as any[];
    
    return rows.map(row => ({
      date: row.date,
      price: row.price,
      change: row.change,
      changePercent: row.changePercent,
    }));
  } catch (error) {
    console.error('Error reading history:', error);
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
    const database = await initGoldPriceTables();
    
    // Upsert: update if exists, insert if not
    const existing = await database.getAllAsync(
      'SELECT id FROM gold_price_history WHERE date = ?',
      [targetDate]
    );
    
    if (existing.length > 0) {
      await database.runAsync(`
        UPDATE gold_price_history 
        SET price = ?, change = ?, changePercent = ?
        WHERE date = ?
      `, [price, change, changePercent, targetDate]);
    } else {
      await database.runAsync(`
        INSERT INTO gold_price_history (date, price, change, changePercent)
        VALUES (?, ?, ?, ?)
      `, [targetDate, price, change, changePercent]);
    }
    
    return entry;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}

export async function migrateStaticData(): Promise<void> {
  try {
    const database = await initGoldPriceTables();
    const rows = await database.getAllAsync('SELECT COUNT(*) as count FROM gold_price_history') as any[];
    
    if (rows[0].count > 0) return;
    
    const staticEntries: HistoryEntry[] = Object.entries(staticPriceData).map(([date, price]) => ({
      date,
      price: typeof price === 'number' ? price : parseFloat(price as string),
      change: 0,
      changePercent: 0,
    }));

    if (staticEntries.length > 0) {
      for (const entry of staticEntries) {
        await database.runAsync(`
          INSERT INTO gold_price_history (date, price, change, changePercent)
          VALUES (?, ?, ?, ?)
        `, [entry.date, entry.price, entry.change, entry.changePercent]);
      }
      console.log('Migrated', staticEntries.length, 'static price entries to SQLite');
    }
  } catch (error) {
    console.error('Error migrating static data:', error);
  }
}

export async function getHistoryLength(): Promise<number> {
  try {
    const database = await initGoldPriceTables();
    const rows = await database.getAllAsync('SELECT COUNT(*) as count FROM gold_price_history') as any[];
    return rows[0].count;
  } catch (error) {
    console.error('Error getting history length:', error);
    return 0;
  }
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
    const database = await initGoldPriceTables();
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
    const database = await initGoldPriceTables();
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
    
    const database = await initGoldPriceTables();
    const now = new Date().toISOString();
    
    // Check if row exists first
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
    
    const database = await initGoldPriceTables();
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
    const database = await initGoldPriceTables();
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
    const database = await initGoldPriceTables();
    await database.runAsync('DELETE FROM user_settings WHERE id = 1');
  } catch (error) {
    console.error('Error clearing user settings:', error);
    throw error;
  }
}

export async function hasApiKey(): Promise<boolean> {
  try {
    const database = await initGoldPriceTables();
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
    
    // Check if migration already done
    const migrationKey = await Storage.getItemAsync('migration_done');
    if (migrationKey) return;
    
    // Migrate user settings
    const settingsData = await Storage.getItemAsync('user_settings');
    if (settingsData) {
      const settings = JSON.parse(settingsData) as UserSettings;
      await saveUserSettings(settings);
    }
    
    // Migrate gold price
    const priceData = await Storage.getItemAsync('gold_price_latest');
    if (priceData) {
      const price = JSON.parse(priceData) as GoldPriceData;
      await savePrice(price);
    }
    
    // Migrate history
    const historyData = await Storage.getItemAsync('gold_price_history');
    if (historyData) {
      const history = JSON.parse(historyData) as HistoryEntry[];
      const database = await initGoldPriceTables();
      for (const entry of history) {
        await database.runAsync(`
          INSERT OR IGNORE INTO gold_price_history (date, price, change, changePercent)
          VALUES (?, ?, ?, ?)
        `, [entry.date, entry.price, entry.change, entry.changePercent]);
      }
    }
    
    // Mark migration as done
    await Storage.setItemAsync('migration_done', 'true');
    console.log('Migration from KV-store completed');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}