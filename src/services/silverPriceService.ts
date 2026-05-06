import { getDb } from './db';

export interface SilverPriceData {
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

interface SilverPriceRow {
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

export async function getLatestSilverPrice(): Promise<SilverPriceData | null> {
  try {
    const database = await getDb();
    const rows = await database.getAllAsync<SilverPriceRow>('SELECT * FROM silver_price_latest WHERE id = 1');
    
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
    console.error('Error reading silver price:', error);
    return null;
  }
}

export async function saveSilverPrice(priceData: SilverPriceData): Promise<SilverPriceData> {
  try {
    const database = await getDb();
    
    await database.runAsync(`
      INSERT OR REPLACE INTO silver_price_latest
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
     console.error('Error saving silver price:', error);
     throw error;
   }
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
): Promise<SilverPriceData> {
  const today = new Date().toISOString().split('T')[0];
  
  const priceData: SilverPriceData = {
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

  return saveSilverPrice(priceData);
}