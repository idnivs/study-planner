import * as SQLite from 'expo-sqlite';
import { MIGRATION_001 } from './migrations/001_initial';
import { seedAll } from './seed';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('study_planner.db');

  await db.execAsync(MIGRATION_001);

  const seeded = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM config WHERE key = '_seeded'`
  );

  if (!seeded || seeded.value !== 'true') {
    await seedAll(db);
    await db.runAsync(
      `INSERT OR REPLACE INTO config (key, value) VALUES ('_seeded', 'true')`
    );
  }

  return db;
}

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call getDatabase() first.');
  return db;
}
