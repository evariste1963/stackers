import { getDb } from './db';
import { MetalType } from './metalPriceApi';

export type { MetalType };

export interface MetalPriceData {
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

interface MetalPriceRow {
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

const TABLE_NAMES: Record<MetalType, string> = {
  gold: 'gold_price_latest',
  silver: 'silver_price_latest',
};

export async function getLatestPrice(metal: MetalType): Promise<MetalPriceData | null> {
  const tableName = TABLE_NAMES[metal];
  try {
    const database = await getDb();
    const row = await database.getFirstAsync<MetalPriceRow>(`SELECT * FROM ${tableName} WHERE id = 1`);
    
    if (row) {
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
    console.error(`Error reading ${metal} price:`, error);
    return null;
  }
}

export async function savePrice(metal: MetalType, priceData: MetalPriceData): Promise<MetalPriceData> {
  if (!priceData.date || typeof priceData.date !== 'string') {
    throw new Error('Invalid priceData: date is required');
  }
  if (!priceData.currency || typeof priceData.currency !== 'string') {
    throw new Error('Invalid priceData: currency is required');
  }
  if (!priceData.unit || typeof priceData.unit !== 'string') {
    throw new Error('Invalid priceData: unit is required');
  }
  if (!priceData.fetchedAt || typeof priceData.fetchedAt !== 'string') {
    throw new Error('Invalid priceData: fetchedAt is required');
  }

  const tableName = TABLE_NAMES[metal];
  try {
    const database = await getDb();
    
    await database.runAsync(`
      INSERT OR REPLACE INTO ${tableName}
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
     console.error(`Error saving ${metal} price:`, error);
     throw error;
   }
}

export async function saveSpotPrice(
  metal: MetalType,
  price: number,
  ask: number,
  bid: number,
  high: number,
  low: number,
  change: number,
  changePercent: number,
  currency: string = 'GBP',
  unit: string = 'toz'
): Promise<MetalPriceData> {
  const today = new Date().toISOString().split('T')[0];
  
  const priceData: MetalPriceData = {
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

  return savePrice(metal, priceData);
}

export async function getLatestGoldPrice(): Promise<MetalPriceData | null> {
  return getLatestPrice('gold');
}

export async function getLatestSilverPrice(): Promise<MetalPriceData | null> {
  return getLatestPrice('silver');
}

export async function saveGoldSpotPrice(
  price: number,
  ask: number,
  bid: number,
  high: number,
  low: number,
  change: number,
  changePercent: number,
  currency: string = 'GBP',
  unit: string = 'toz'
): Promise<MetalPriceData> {
  return saveSpotPrice('gold', price, ask, bid, high, low, change, changePercent, currency, unit);
}

export async function saveSilverSpotPrice(
  price: number,
  ask: number,
  bid: number,
  high: number,
  low: number,
  change: number,
  changePercent: number,
  currency: string = 'GBP',
  unit: string = 'toz'
): Promise<MetalPriceData> {
  return saveSpotPrice('silver', price, ask, bid, high, low, change, changePercent, currency, unit);
}

export async function saveGoldPrice(priceData: MetalPriceData): Promise<MetalPriceData> {
  return savePrice('gold', priceData);
}

export async function saveSilverPrice(priceData: MetalPriceData): Promise<MetalPriceData> {
  return savePrice('silver', priceData);
}