import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  // Prevent multiple simultaneous open calls
  if (dbPromise) return dbPromise;
  
  dbPromise = (async () => {
    try {
      const database = await SQLite.openDatabaseAsync('stackers.db');
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS stack_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL,
          weight TEXT NOT NULL,
          purchasePrice TEXT NOT NULL,
          premium TEXT NOT NULL,
          imageUri TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      db = database;
      return database;
    } catch (error) {
      console.error('Error opening database:', error);
      dbPromise = null;
      throw error;
    }
  })();
  
  return dbPromise;
}

export interface StackItem {
  id: number;
  code: string;
  weight: string;
  purchasePrice: string;
  premium: string;
  imageUri: string | null;
  createdAt: string;
}

export async function getAllItems(): Promise<StackItem[]> {
  const database = await getDb();
  const rows = await database.getAllAsync('SELECT * FROM stack_items ORDER BY createdAt DESC') as any[];
  return rows.map(row => ({
    id: Number(row.id),
    code: row.code,
    weight: row.weight,
    purchasePrice: row.purchasePrice,
    premium: row.premium,
    imageUri: row.imageUri,
    createdAt: row.createdAt,
  }));
}

export async function addItem(item: Omit<StackItem, 'id' | 'createdAt'>): Promise<StackItem> {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO stack_items (code, weight, purchasePrice, premium, imageUri) VALUES (?, ?, ?, ?, ?)',
    [item.code, item.weight, item.purchasePrice, item.premium, item.imageUri]
  );
  return {
    id: Number(result.lastInsertRowId),
    code: item.code,
    weight: item.weight,
    purchasePrice: item.purchasePrice,
    premium: item.premium,
    imageUri: item.imageUri,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteItems(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(`DELETE FROM stack_items WHERE id IN (${placeholders})`, ids);
}
