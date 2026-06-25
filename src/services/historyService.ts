import { getDb } from './db';
import { goldData } from '../../assets/goldData.js';
import { silverData } from '../../assets/silverData.js';
import { fetchYahooHistory, fetchCurrencyRate } from './yahooFinanceApi';

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
    const rows = await database.getAllAsync<HistoryRow>(
      `SELECT * FROM ${tableName} WHERE date >= date('now', '-13 months') ORDER BY date ASC`
    );
    
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
    gms: price,
    toz: price,
    change,
    changePercent,
  };

  try {
    const database = await getDb();
    const tableName = getHistoryTable(metal);

    const existing = await database.getFirstAsync<HistoryRow>(
      `SELECT * FROM ${tableName} WHERE date = ?`, [targetDate]
    );
    if (existing && price <= existing.price) {
      return {
        date: existing.date,
        price: existing.price,
        gms: existing.gms || existing.price,
        toz: existing.toz || existing.gms || existing.price,
        change: existing.change,
        changePercent: existing.changePercent,
      };
    }
    
    await database.runAsync(`
      INSERT OR REPLACE INTO ${tableName} (date, price, change, changePercent)
      VALUES (?, ?, ?, ?)
    `, [targetDate, price, change, changePercent]);

    await pruneOldHistory(metal);
    
    return entry;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}

export async function pruneOldHistory(metal: MetalType = 'gold'): Promise<void> {
  try {
    const database = await getDb();
    const tableName = getHistoryTable(metal);
    
    await database.runAsync(`
      DELETE FROM ${tableName}
      WHERE date < date('now', '-13 months')
    `);
  } catch (error) {
    console.error('Error pruning old history:', error);
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
      await database.withTransactionAsync(async () => {
        for (const entry of staticEntries) {
          await database.runAsync(`
            INSERT OR REPLACE INTO ${tableName} (date, price, gms, toz, change, changePercent)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [entry.date, entry.price, entry.gms, entry.toz, entry.change, entry.changePercent]);
        }
      });
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

export async function seedYahooHistory(metal: MetalType = 'gold', currency: string = 'GBP'): Promise<boolean> {
  try {
    const [entries, rate] = await Promise.all([
      fetchYahooHistory(metal),
      fetchCurrencyRate(currency),
    ]);

    if (entries.length === 0) return false;

    const database = await getDb();
    const tableName = getHistoryTable(metal);

    await database.withTransactionAsync(async () => {
      for (const entry of entries) {
        const convertedPrice = entry.close * rate;
        const gmsPrice = convertedPrice / 31.1035;
        await database.runAsync(
          `INSERT OR REPLACE INTO ${tableName} (date, price, gms, toz, change, changePercent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [entry.date, convertedPrice, gmsPrice, convertedPrice, 0, 0]
        );
      }
    });

    console.log(`Seeded ${entries.length} Yahoo Finance entries for ${metal} (currency: ${currency}, rate: ${rate})`);
    return true;
  } catch (error) {
    console.error(`Error seeding Yahoo history for ${metal}:`, error);
    return false;
  }
}

export async function getTodayPriceEntry(metal: MetalType = 'gold'): Promise<HistoryEntry | null> {
  const database = await getDb();
  const tableName = getHistoryTable(metal);
  const today = new Date().toISOString().split('T')[0];
  const row = await database.getFirstAsync<HistoryRow>(
    `SELECT * FROM ${tableName} WHERE date = ? ORDER BY id DESC LIMIT 1`,
    [today]
  );
  if (row) {
    return {
      date: row.date,
      price: row.price,
      gms: row.gms || row.price,
      toz: row.toz || row.gms || row.price,
      change: row.change,
      changePercent: row.changePercent,
    };
  }
  return null;
}

export async function updateTodayPriceEntry(
  metal: MetalType = 'gold',
  price: number,
  change: number = 0,
  changePercent: number = 0
): Promise<boolean> {
  try {
    const database = await getDb();
    const tableName = getHistoryTable(metal);
    const today = new Date().toISOString().split('T')[0];
    const result = await database.runAsync(`
      UPDATE ${tableName}
      SET price = ?, gms = ?, toz = ?, change = ?, changePercent = ?
      WHERE date = ?
    `, [price, price, price, change, changePercent, today]);
    return (result as unknown as { changes: number }).changes > 0;
  } catch (error) {
    console.error('Error updating today history entry:', error);
    throw error;
  }
}

export async function clearAndReseedHistory(currency: string = 'GBP'): Promise<{ gold: HistoryEntry[]; silver: HistoryEntry[] }> {
  try {
    const database = await getDb();
    await database.execAsync('DELETE FROM gold_price_history');
    await database.execAsync('DELETE FROM silver_price_history');

    const goldSeeded = await seedYahooHistory('gold', currency);
    if (!goldSeeded) await migrateStaticData('gold');

    const silverSeeded = await seedYahooHistory('silver', currency);
    if (!silverSeeded) await migrateStaticData('silver');

    const gold = await getHistory('gold');
    const silver = await getHistory('silver');
    return { gold, silver };
  } catch (error) {
    console.error('Error clearing and reseeding history:', error);
    return { gold: [], silver: [] };
  }
}