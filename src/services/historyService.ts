import * as SQLite from 'expo-sqlite';
import { getDb } from './stackStorage';
import { priceData as staticPriceData } from '../../assets/priceData.js';

let goldPriceDb: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initHistoryTables(): Promise<SQLite.SQLiteDatabase> {
  if (goldPriceDb) return goldPriceDb;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const database = await getDb();
      goldPriceDb = database;
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS gold_price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          price REAL,
          change REAL,
          changePercent REAL
        );
      `);
      
      return database;
    } catch (error) {
      console.error('Error initializing history tables:', error);
      initPromise = null;
      throw error;
    }
  })();
  
  return initPromise;
}

export interface HistoryEntry {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const database = await initHistoryTables();
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
    const database = await initHistoryTables();
    
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
    const database = await initHistoryTables();
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
    const database = await initHistoryTables();
    const rows = await database.getAllAsync('SELECT COUNT(*) as count FROM gold_price_history') as any[];
    return rows[0].count;
  } catch (error) {
    console.error('Error getting history length:', error);
    return 0;
  }
}