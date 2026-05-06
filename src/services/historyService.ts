import { getDb } from './db';
import { goldData } from '../../assets/goldData.js';
import { silverData } from '../../assets/silverData.js';

const staticDataMap = {
  gold: goldData,
  silver: silverData,
};

export type MetalType = 'gold' | 'silver';

export interface HistoryEntry {
  date: string;
  price: number;
  gms: number;
  toz: number;
  change: number;
  changePercent: number;
}

interface HistoryRow {
  date: string;
  price: number;
  gms: number;
  toz: number;
  change: number;
  changePercent: number;
}

interface CountRow {
  count: number;
}

function getHistoryTable(metal: MetalType): string {
  return metal === 'gold' ? 'gold_price_history' : 'silver_price_history';
}

export async function getHistory(metal: MetalType = 'gold'): Promise<HistoryEntry[]> {
  try {
    const database = await getDb();
    const tableName = getHistoryTable(metal);
    const rows = await database.getAllAsync<HistoryRow>(`SELECT * FROM ${tableName} ORDER BY date ASC`);
    
    return rows.map(row => ({
      date: row.date,
      price: row.gms || row.price,
      gms: row.gms || row.price,
      toz: row.toz || row.gms || row.price,
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
  metal: MetalType = 'gold',
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
    const database = await getDb();
    const tableName = getHistoryTable(metal);
    
    const existing = await database.getAllAsync<HistoryRow>(
      `SELECT * FROM ${tableName} WHERE date = ?`,
      [targetDate]
    );
    
    if (existing.length > 0) {
      if (price > existing[0].price) {
        await database.runAsync(`
          UPDATE ${tableName} 
          SET price = ?, change = ?, changePercent = ?
          WHERE date = ?
        `, [price, change, changePercent, targetDate]);
      }
    } else {
      await database.runAsync(`
        INSERT INTO ${tableName} (date, price, change, changePercent)
        VALUES (?, ?, ?, ?)
      `, [targetDate, price, change, changePercent]);
    }
    
    return entry;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}

export async function migrateStaticData(metal: MetalType = 'gold'): Promise<void> {
  try {
    const database = await getDb();
    const tableName = getHistoryTable(metal);
    const rows = await database.getAllAsync<CountRow>(`SELECT COUNT(*) as count FROM ${tableName}`);
    
    if (rows[0].count > 0) return;
    
    const priceData = staticDataMap[metal];
    const staticEntries: HistoryEntry[] = Object.entries(priceData).map(([date, data]) => ({
      date,
      price: typeof data === 'object' ? data.gms : parseFloat(data as string),
      gms: typeof data === 'object' ? data.gms : parseFloat(data as string),
      toz: typeof data === 'object' ? data.toz : parseFloat(data as string),
      change: 0,
      changePercent: 0,
    }));

    if (staticEntries.length > 0) {
      for (const entry of staticEntries) {
        await database.runAsync(`
          INSERT INTO ${tableName} (date, price, gms, toz, change, changePercent)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [entry.date, entry.price, entry.gms, entry.toz, entry.change, entry.changePercent]);
      }
      console.log('Migrated', staticEntries.length, 'static price entries to SQLite for', metal);
    }
  } catch (error) {
    console.error('Error migrating static data:', error);
  }
}

export async function getHistoryLength(metal: MetalType = 'gold'): Promise<number> {
  try {
    const database = await getDb();
    const tableName = getHistoryTable(metal);
    const rows = await database.getAllAsync<CountRow>(`SELECT COUNT(*) as count FROM ${tableName}`);
    return rows[0].count;
  } catch (error) {
    console.error('Error getting history length:', error);
    return 0;
  }
}