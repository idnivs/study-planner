import { getDb } from '../database';
import { KnowledgeDetail, KnowledgeReference } from '../../types/knowledge';

export async function getKnowledgeDetail(
  taskId: string, treeId: string
): Promise<KnowledgeDetail | null> {
  return getDb().getFirstAsync<KnowledgeDetail>(
    `SELECT * FROM knowledge_detail WHERE task_id = ? AND tree_id = ?`,
    taskId, treeId
  );
}

export async function saveKnowledgeDetail(
  taskId: string, treeId: string, detail: string
): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO knowledge_detail (task_id, tree_id, detail, last_updated)
     VALUES (?, ?, ?, datetime('now'))`,
    taskId, treeId, detail
  );
}

export async function getReferences(
  taskId: string, treeId: string
): Promise<KnowledgeReference[]> {
  return getDb().getAllAsync<KnowledgeReference>(
    `SELECT * FROM knowledge_references WHERE task_id = ? AND tree_id = ?
     ORDER BY sort_order`,
    taskId, treeId
  );
}

export async function addReference(
  taskId: string, treeId: string,
  title: string, url: string, note: string
): Promise<number> {
  const result = await getDb().runAsync(
    `INSERT INTO knowledge_references (task_id, tree_id, title, url, note, sort_order)
     VALUES (?, ?, ?, ?, ?,
       (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM knowledge_references
        WHERE task_id = ? AND tree_id = ?))`,
    taskId, treeId, title, url, note, taskId, treeId
  );
  return result.lastInsertRowId;
}

export async function updateReference(
  refId: number, title: string, url: string, note: string
): Promise<void> {
  await getDb().runAsync(
    `UPDATE knowledge_references SET title = ?, url = ?, note = ? WHERE id = ?`,
    title, url, note, refId
  );
}

export async function removeReference(refId: number): Promise<void> {
  await getDb().runAsync(
    `DELETE FROM knowledge_references WHERE id = ?`, refId
  );
}

export async function getReferenceById(
  refId: number
): Promise<KnowledgeReference | null> {
  return getDb().getFirstAsync<KnowledgeReference>(
    `SELECT * FROM knowledge_references WHERE id = ?`, refId
  );
}
