import * as SQLite from 'expo-sqlite';
import { getDb } from './stackStorage';

let goldPriceDb: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initPriceTables(): Promise<SQLite.SQLiteDatabase> {
  if (goldPriceDb) return goldPriceDb;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const database = await getDb();
      goldPriceDb = database;
      
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
      
      return database;
    } catch (error) {
      console.error('Error initializing price tables:', error);
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

export async function getLatestPrice(): Promise<GoldPriceData | null> {
  try {
    const database = await initPriceTables();
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

export async function savePrice(priceData: GoldPriceData): Promise<GoldPriceData> {
  try {
    const database = await initPriceTables();
    
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