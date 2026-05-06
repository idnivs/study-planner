import { getDb } from '../database';
import { TreeMeta, Category } from '../../types/tree';

export async function getAllTrees(): Promise<TreeMeta[]> {
  return getDb().getAllAsync<TreeMeta>(
    `SELECT id, name, description, version, created_at, updated_at FROM trees ORDER BY name`
  );
}

export async function getTree(treeId: string): Promise<TreeMeta | null> {
  return getDb().getFirstAsync<TreeMeta>(
    `SELECT id, name, description, version, created_at, updated_at FROM trees WHERE id = ?`,
    treeId
  );
}

export async function createTree(
  id: string, name: string, description: string
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO trees (id, name, description) VALUES (?, ?, ?)`, id, name, description
  );
}

export async function getCategories(treeIds: string[]): Promise<Category[]> {
  if (treeIds.length === 0) return [];
  const placeholders = treeIds.map(() => '?').join(',');
  return getDb().getAllAsync<Category>(
    `SELECT * FROM categories WHERE tree_id IN (${placeholders}) ORDER BY tree_id, sort_order`,
    ...treeIds
  );
}

export async function getCategory(treeId: string, name: string): Promise<Category | null> {
  return getDb().getFirstAsync<Category>(
    `SELECT * FROM categories WHERE tree_id = ? AND name = ?`, treeId, name
  );
}
