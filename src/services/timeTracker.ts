import { getTimeRecords, addTimeRecord } from '../db/repositories/progressRepo';

export function getAdjustedEstimate(
  records: { estimated_min: number; actual_min: number }[],
  defaultMin: number
): number {
  if (!records || records.length === 0) return defaultMin;

  const recent = records.slice(-10);
  const avgActual = recent.reduce((s, r) => s + r.actual_min, 0) / recent.length;
  const avgEstimated = recent.reduce((s, r) => s + r.estimated_min, 0) / recent.length;

  if (avgEstimated === 0) return defaultMin;

  const ratio = avgActual / avgEstimated;
  const adjusted = Math.round(defaultMin * ratio * 0.7 + defaultMin * 0.3);
  return Math.max(5, Math.min(adjusted, defaultMin * 3));
}

export async function getTaskAdjustedEstimate(
  taskId: string, treeId: string, defaultMin: number
): Promise<number> {
  const records = await getTimeRecords(taskId, treeId, 20);
  return getAdjustedEstimate(records, defaultMin);
}

export async function recordTime(
  taskId: string, treeId: string,
  estimatedMin: number, actualSec: number
): Promise<void> {
  const actualMin = Math.round(actualSec / 6) / 10; // round to 1 decimal
  const today = new Date().toISOString().slice(0, 10);
  await addTimeRecord(taskId, treeId, today, estimatedMin, actualMin);
}

export async function getTaskStats(
  taskId: string, treeId: string
): Promise<{ count: number; avgActual: number; avgEstimated: number } | null> {
  const records = await getTimeRecords(taskId, treeId, 20);
  if (records.length === 0) return null;

  const avgActual = records.reduce((s, r) => s + r.actual_min, 0) / records.length;
  const avgEstimated = records.reduce((s, r) => s + r.estimated_min, 0) / records.length;

  return {
    count: records.length,
    avgActual: Math.round(avgActual * 10) / 10,
    avgEstimated: Math.round(avgEstimated * 10) / 10,
  };
}
