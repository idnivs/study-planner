import { getDb } from '../database';
import { Task } from '../../types/task';

export async function getTasksByTrees(treeIds: string[]): Promise<Task[]> {
  if (treeIds.length === 0) return [];
  const placeholders = treeIds.map(() => '?').join(',');
  return getDb().getAllAsync<Task>(
    `SELECT * FROM tasks WHERE tree_id IN (${placeholders}) ORDER BY category, module, chapter, id`,
    ...treeIds
  );
}

export async function getTasksByCategory(treeId: string, category: string): Promise<Task[]> {
  return getDb().getAllAsync<Task>(
    `SELECT * FROM tasks WHERE tree_id = ? AND category = ? ORDER BY module, chapter, id`,
    treeId, category
  );
}

export async function getTask(taskId: string, treeId: string): Promise<Task | null> {
  return getDb().getFirstAsync<Task>(
    `SELECT * FROM tasks WHERE id = ? AND tree_id = ?`, taskId, treeId
  );
}

export async function searchTasks(
  treeIds: string[], query: string
): Promise<Task[]> {
  if (treeIds.length === 0 || !query.trim()) return [];
  const treePlaceholders = treeIds.map(() => '?').join(',');
  return getDb().getAllAsync<Task>(
    `SELECT t.* FROM tasks t
     JOIN tasks_fts fts ON t.rowid = fts.rowid
     WHERE t.tree_id IN (${treePlaceholders})
       AND tasks_fts MATCH ?
     ORDER BY rank`,
    ...treeIds,
    `"${query}"`
  );
}

export async function addCustomTask(task: Task): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO tasks (id, tree_id, category, module, chapter, title, minutes, priority, is_custom)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    task.id, task.tree_id, task.category, task.module, task.chapter,
    task.title, task.minutes, task.priority
  );
}

export async function deleteCustomTask(taskId: string, treeId: string): Promise<void> {
  await getDb().runAsync(
    `DELETE FROM tasks WHERE id = ? AND tree_id = ? AND is_custom = 1`,
    taskId, treeId
  );
}

export async function updateTask(
  taskId: string, treeId: string, changes: Partial<Task>
): Promise<void> {
  const fields = Object.keys(changes).filter(k => k !== 'id' && k !== 'tree_id');
  if (fields.length === 0) return;
  const sets = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (changes as any)[f]);
  await getDb().runAsync(
    `UPDATE tasks SET ${sets} WHERE id = ? AND tree_id = ?`,
    ...values, taskId, treeId
  );
}

export async function getPrerequisitesByTrees(
  treeIds: string[]
): Promise<Record<string, string[]>> {
  if (treeIds.length === 0) return {};
  const placeholders = treeIds.map(() => '?').join(',');
  const rows = await getDb().getAllAsync<{ task_id: string; prereq_id: string }>(
    `SELECT task_id, prereq_id FROM prerequisites WHERE tree_id IN (${placeholders}) ORDER BY task_id`,
    ...treeIds
  );
  const result: Record<string, string[]> = {};
  for (const row of rows) {
    if (!result[row.task_id]) result[row.task_id] = [];
    result[row.task_id].push(row.prereq_id);
  }
  return result;
}

export async function getPrerequisites(
  taskId: string, treeId: string
): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ prereq_id: string }>(
    `SELECT prereq_id FROM prerequisites WHERE task_id = ? AND tree_id = ? ORDER BY prereq_id`,
    taskId, treeId
  );
  return rows.map(r => r.prereq_id);
}

export async function addPrerequisite(
  taskId: string, treeId: string, prereqId: string
): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO prerequisites (task_id, tree_id, prereq_id) VALUES (?, ?, ?)`,
    taskId, treeId, prereqId
  );
}

export async function getSubtasks(
  taskId: string, treeId: string
): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ description: string }>(
    `SELECT description FROM subtasks WHERE parent_id = ? AND tree_id = ? ORDER BY sort_order`,
    taskId, treeId
  );
  return rows.map(r => r.description);
}

export async function addSubtasks(
  parentId: string, treeId: string, descriptions: string[]
): Promise<void> {
  for (let i = 0; i < descriptions.length; i++) {
    await getDb().runAsync(
      `INSERT OR REPLACE INTO subtasks (parent_id, tree_id, sort_order, description)
       VALUES (?, ?, ?, ?)`,
      parentId, treeId, i, descriptions[i]
    );
  }
}
