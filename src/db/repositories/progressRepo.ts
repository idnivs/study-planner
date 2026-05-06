import { getDb } from '../database';
import { Progress, TimeRecord } from '../../types/progress';

export async function getCompletedByTree(treeIds: string[]): Promise<Record<string, boolean>> {
  if (treeIds.length === 0) return {};
  const placeholders = treeIds.map(() => '?').join(',');
  const rows = await getDb().getAllAsync<Progress>(
    `SELECT * FROM progress WHERE tree_id IN (${placeholders}) AND completed = 1`,
    ...treeIds
  );
  const result: Record<string, boolean> = {};
  for (const row of rows) {
    result[row.task_id] = true;
  }
  return result;
}

export async function setCompleted(
  taskId: string, treeId: string, done: boolean
): Promise<void> {
  if (done) {
    await getDb().runAsync(
      `INSERT OR REPLACE INTO progress (task_id, tree_id, completed, completed_at)
       VALUES (?, ?, 1, datetime('now'))`,
      taskId, treeId
    );
  } else {
    await getDb().runAsync(
      `DELETE FROM progress WHERE task_id = ? AND tree_id = ?`,
      taskId, treeId
    );
  }
}

export async function resetAllProgress(treeIds: string[]): Promise<void> {
  if (treeIds.length === 0) return;
  const placeholders = treeIds.map(() => '?').join(',');
  await getDb().runAsync(
    `DELETE FROM progress WHERE tree_id IN (${placeholders})`,
    ...treeIds
  );
}

export async function getTimeRecords(
  taskId: string, treeId: string, limit: number = 20
): Promise<TimeRecord[]> {
  return getDb().getAllAsync<TimeRecord>(
    `SELECT * FROM time_records WHERE task_id = ? AND tree_id = ?
     ORDER BY record_date DESC, id DESC LIMIT ?`,
    taskId, treeId, limit
  );
}

export async function addTimeRecord(
  taskId: string, treeId: string, recordDate: string,
  estimatedMin: number, actualMin: number
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO time_records (task_id, tree_id, record_date, estimated_min, actual_min)
     VALUES (?, ?, ?, ?, ?)`,
    taskId, treeId, recordDate, estimatedMin, actualMin
  );
  // Keep only last 20 records per task
  await getDb().runAsync(
    `DELETE FROM time_records WHERE id IN (
      SELECT id FROM time_records WHERE task_id = ? AND tree_id = ?
      ORDER BY record_date DESC, id DESC LIMIT -1 OFFSET 20
    )`,
    taskId, treeId
  );
}

export async function getTotalTimeStats(): Promise<{ sessions: number; hours: number }> {
  const row = await getDb().getFirstAsync<{ sessions: number; total_min: number }>(
    `SELECT COUNT(*) as sessions, COALESCE(SUM(actual_min), 0) as total_min FROM time_records`
  );
  return {
    sessions: row?.sessions || 0,
    hours: (row?.total_min || 0) / 60,
  };
}
