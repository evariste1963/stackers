import * as SQLite from 'expo-sqlite';
import { File, Directory, Paths } from 'expo-file-system';

const IMAGES_DIR = new Directory(Paths.document, 'images');

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
          premium TEXT NOT NULL DEFAULT '',
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
    premium: row.premium || '',
    imageUri: row.imageUri,
    createdAt: row.createdAt,
  }));
}

export async function addItem(item: Omit<StackItem, 'id' | 'createdAt'>): Promise<StackItem> {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO stack_items (code, weight, purchasePrice, premium, imageUri) VALUES (?, ?, ?, ?, ?)',
    [item.code, item.weight, item.purchasePrice, item.premium || '', item.imageUri || null]
  );
  return {
    id: Number(result.lastInsertRowId),
    code: item.code,
    weight: item.weight,
    purchasePrice: item.purchasePrice,
    premium: item.premium || '',
    imageUri: item.imageUri,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteItems(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDb();

  const placeholders = ids.map(() => '?').join(',');
  const rows = await database.getAllAsync(
    `SELECT id, imageUri FROM stack_items WHERE id IN (${placeholders})`,
    ids
  ) as { id: number; imageUri: string | null }[];

  for (const row of rows) {
    if (row.imageUri) {
      try {
        const file = new File(row.imageUri);
        if (file.exists) {
          await file.delete();
        }
      } catch (err) {
        console.warn('Failed to delete image file:', row.imageUri, err);
      }
    }
  }

  await database.runAsync(`DELETE FROM stack_items WHERE id IN (${placeholders})`, ids);
}

export async function cleanOrphanedImages(): Promise<number> {
  try {
    if (!IMAGES_DIR.exists) {
      return 0;
    }

    const database = await getDb();
    const rows = await database.getAllAsync('SELECT imageUri FROM stack_items') as { imageUri: string | null }[];
    const usedUris = new Set(rows.filter(r => r.imageUri).map(r => r.imageUri));

    const files = IMAGES_DIR.list();
    let cleaned = 0;

    for (const file of files) {
      if (file instanceof File && !usedUris.has(file.uri)) {
        try {
          await file.delete();
          cleaned++;
        } catch (err) {
          console.warn('Failed to delete orphaned image:', file.uri, err);
        }
      }
    }

    return cleaned;
  } catch (err) {
    console.warn('Failed to clean orphaned images:', err);
    return 0;
  }
}
