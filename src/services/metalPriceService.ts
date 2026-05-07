import { getDb } from './db';

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

type MetalType = 'gold' | 'silver';

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

function getTableName(metal: MetalType): string {
  return TABLE_NAMES[metal];
}

export async function getLatestPrice(metal: MetalType): Promise<MetalPriceData | null> {
  const tableName = getTableName(metal);
  try {
    const database = await getDb();
    const rows = await database.getAllAsync<MetalPriceRow>(`SELECT * FROM ${tableName} WHERE id = 1`);
    
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
    console.error(`Error reading ${metal} price:`, error);
    return null;
  }
}

export async function savePrice(metal: MetalType, priceData: MetalPriceData): Promise<MetalPriceData> {
  const tableName = getTableName(metal);
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