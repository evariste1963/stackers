import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  if (dbPromise) return dbPromise;
  
  dbPromise = (async () => {
    const database = await SQLite.openDatabaseAsync('stackers.db');
    db = database;
    return database;
  })();
  
  return dbPromise;
}

export async function initAllTables(): Promise<void> {
  const database = await getDb();
  
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
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      currency TEXT DEFAULT 'GBP',
      unit TEXT DEFAULT 'toz',
      hasApiKey INTEGER DEFAULT 0,
      manualPrice REAL,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
  
  {
    const existingSettings = await database.getFirstAsync('SELECT id FROM user_settings WHERE id = 1');
    if (!existingSettings) {
      const now = new Date().toISOString();
      await database.runAsync(
        'INSERT INTO user_settings (id, currency, unit, hasApiKey, manualPrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 'GBP', 'toz', 0, null, now, now]
      );
    }
  }
  
  {
    let hasColumn = false;
    try {
      await database.getFirstAsync('SELECT manualPrice FROM user_settings WHERE id = 1');
      hasColumn = true;
    } catch {}
    if (!hasColumn) {
      try {
        await database.execAsync('ALTER TABLE user_settings ADD COLUMN manualPrice REAL');
      } catch {}
    }
  }
}

export type { SQLiteDatabase } from 'expo-sqlite';