import { getDb } from '../database';

export async function getConfig(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ value: string }>(
    `SELECT value FROM config WHERE key = ?`, key
  );
  return row?.value ?? null;
}

export async function setConfig(key: string, value: string): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, key, value
  );
}

export async function getAllConfig(): Promise<Record<string, string>> {
  const rows = await getDb().getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM config WHERE key != '_seeded'`
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
