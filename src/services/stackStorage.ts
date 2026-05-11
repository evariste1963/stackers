import { File, Directory, Paths } from 'expo-file-system';
import { getDb } from './db';

const IMAGES_DIR = new Directory(Paths.document, 'images');

export type MetalType = 'gold' | 'silver';

export interface StackItem {
  id: number;
  code: string;
  weight: string;
  purchasePrice: string;
  premium: string;
  imageUri: string | null;
  metal: MetalType;
  createdAt: string;
}

interface StackItemRow {
  id: number;
  code: string;
  weight: string;
  purchasePrice: string;
  premium: string;
  imageUri: string | null;
  metal: string;
  createdAt: string;
}

function mapRowToStackItem(row: StackItemRow): StackItem {
  return {
    id: Number(row.id),
    code: row.code,
    weight: row.weight,
    purchasePrice: row.purchasePrice,
    premium: row.premium || '',
    imageUri: row.imageUri,
    metal: (row.metal || 'gold') as MetalType,
    createdAt: row.createdAt,
  };
}

export async function getAllItems(): Promise<StackItem[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<StackItemRow>('SELECT * FROM stack_items ORDER BY createdAt DESC');
  return rows.map(mapRowToStackItem);
}

export async function getItemsByMetal(metal: MetalType): Promise<StackItem[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<StackItemRow>('SELECT * FROM stack_items WHERE metal = ? ORDER BY createdAt DESC', [metal]);
  return rows.map(mapRowToStackItem);
}

export async function getItemById(id: number): Promise<StackItem | null> {
  const database = await getDb();
  const rows = await database.getAllAsync<StackItemRow>('SELECT * FROM stack_items WHERE id = ?', [id]);
  return rows.length > 0 ? mapRowToStackItem(rows[0]) : null;
}

export async function addItem(item: Omit<StackItem, 'id' | 'createdAt'>): Promise<StackItem> {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO stack_items (code, weight, purchasePrice, premium, imageUri, metal) VALUES (?, ?, ?, ?, ?, ?)',
    [item.code, item.weight, item.purchasePrice, item.premium || '', item.imageUri || null, item.metal || 'gold']
  );
  return {
    id: Number(result.lastInsertRowId),
    code: item.code,
    weight: item.weight,
    purchasePrice: item.purchasePrice,
    premium: item.premium || '',
    imageUri: item.imageUri,
    metal: item.metal || 'gold',
    createdAt: new Date().toISOString(),
  };
}

export async function updateItem(id: number, item: Omit<StackItem, 'id' | 'createdAt'>): Promise<StackItem> {
  const database = await getDb();
  await database.runAsync(
    'UPDATE stack_items SET code = ?, weight = ?, purchasePrice = ?, premium = ?, imageUri = ?, metal = ? WHERE id = ?',
    [item.code, item.weight, item.purchasePrice, item.premium || '', item.imageUri || null, item.metal || 'gold', id]
  );
  const rows = await database.getAllAsync<StackItemRow>('SELECT * FROM stack_items WHERE id = ?', [id]);
  const row = rows[0];
  return {
    id: Number(row.id),
    code: row.code,
    weight: row.weight,
    purchasePrice: row.purchasePrice,
    premium: row.premium || '',
    imageUri: row.imageUri,
    metal: (row.metal || 'gold') as MetalType,
    createdAt: row.createdAt,
  };
}

export async function deleteItems(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDb();

  const placeholders = ids.map(() => '?').join(',');
  const rows = await database.getAllAsync<{ id: number; imageUri: string | null }>(
    `SELECT id, imageUri FROM stack_items WHERE id IN (${placeholders})`,
    ids
  );

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
    const rows = await database.getAllAsync<{ imageUri: string | null }>('SELECT imageUri FROM stack_items');
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