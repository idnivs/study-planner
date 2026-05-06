import * as SQLite from 'expo-sqlite';
import tree11408 from '../../assets/seed/11408.json';
import treeFitness from '../../assets/seed/fitness.json';
import progress11408 from '../../assets/seed/progress_11408.json';
import timeRecords from '../../assets/seed/progress_11408_time.json';
import knowledge4C01 from '../../assets/seed/knowledge_4-C-01.json';

interface JsonTree {
  meta: { name?: string; description?: string; version?: string };
  categories: Record<string, { daily_budget_min: number; icon: string; color: string }>;
  tasks: JsonTask[];
}

interface JsonTask {
  id: string;
  category: string;
  module?: string;
  chapter?: string;
  title: string;
  minutes: number;
  priority: number;
  prerequisites?: string[];
  decomposable?: boolean;
  subtasks?: string[];
  trigger?: string;
}

export async function seedAll(db: SQLite.SQLiteDatabase): Promise<void> {
  await seedConfig(db);
  await seedTree(db, '11408', tree11408 as JsonTree);
  await seedTree(db, 'fitness', treeFitness as JsonTree);
  await seedProgress(db);
  await seedTimeRecords(db);
  await seedKnowledge(db);
}

async function seedConfig(db: SQLite.SQLiteDatabase) {
  const configs: [string, string][] = [
    ['model', 'deepseek-v4-flash'],
    ['thinking_mode', 'non-thinking'],
    ['temperature', '1.0'],
    ['max_tokens', '2048'],
    ['base_url', 'https://api.deepseek.com/v1/chat/completions'],
    ['active_trees', '["11408"]'],
    ['llm_enabled', 'false'],
  ];
  for (const [key, value] of configs) {
    await db.runAsync(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, key, value);
  }
}

async function seedTree(db: SQLite.SQLiteDatabase, treeId: string, tree: JsonTree) {
  const meta = tree.meta || {};
  await db.runAsync(
    `INSERT OR REPLACE INTO trees (id, name, description, version) VALUES (?, ?, ?, ?)`,
    treeId,
    meta.name || treeId,
    meta.description || '',
    meta.version || '1.0'
  );

  let sort = 0;
  for (const [catName, catData] of Object.entries(tree.categories)) {
    await db.runAsync(
      `INSERT OR REPLACE INTO categories (tree_id, name, daily_budget_min, icon, color, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      treeId, catName, catData.daily_budget_min, catData.icon, catData.color, sort++
    );
  }

  for (const task of tree.tasks) {
    await db.runAsync(
      `INSERT OR REPLACE INTO tasks (id, tree_id, category, module, chapter, title, minutes, priority, decomposable, trigger_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      task.id,
      treeId,
      task.category,
      task.module || '',
      task.chapter || '',
      task.title,
      task.minutes,
      task.priority,
      task.decomposable ? 1 : 0,
      task.trigger || null
    );

    if (task.prerequisites) {
      for (const prereqId of task.prerequisites) {
        await db.runAsync(
          `INSERT OR REPLACE INTO prerequisites (task_id, tree_id, prereq_id) VALUES (?, ?, ?)`,
          task.id, treeId, prereqId
        );
      }
    }

    if (task.subtasks) {
      for (let i = 0; i < task.subtasks.length; i++) {
        await db.runAsync(
          `INSERT OR REPLACE INTO subtasks (parent_id, tree_id, sort_order, description) VALUES (?, ?, ?, ?)`,
          task.id, treeId, i, task.subtasks[i]
        );
      }
    }
  }
}

async function seedProgress(db: SQLite.SQLiteDatabase) {
  const completed = (progress11408 as any).completed || {};
  for (const [taskId, done] of Object.entries(completed)) {
    if (done) {
      await db.runAsync(
        `INSERT OR REPLACE INTO progress (task_id, tree_id, completed, completed_at)
         VALUES (?, '11408', 1, ?)`,
        taskId,
        (progress11408 as any).last_updated || new Date().toISOString()
      );
    }
  }
}

async function seedTimeRecords(db: SQLite.SQLiteDatabase) {
  const records = (timeRecords as any) || {};
  for (const [taskId, recs] of Object.entries(records)) {
    if (!Array.isArray(recs)) continue;
    for (const rec of recs as any[]) {
      await db.runAsync(
        `INSERT INTO time_records (task_id, tree_id, record_date, estimated_min, actual_min)
         VALUES (?, '11408', ?, ?, ?)`,
        taskId,
        rec.date || '',
        rec.estimated || 0,
        rec.actual || 0
      );
    }
  }
}

async function seedKnowledge(db: SQLite.SQLiteDatabase) {
  const data = knowledge4C01 as any;
  if (!data || !data.detail) return;

  await db.runAsync(
    `INSERT OR REPLACE INTO knowledge_detail (task_id, tree_id, detail, last_updated)
     VALUES ('4-C-01', '11408', ?, ?)`,
    data.detail,
    data.last_updated || new Date().toISOString()
  );

  const refs = data.references || [];
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    await db.runAsync(
      `INSERT OR REPLACE INTO knowledge_references (task_id, tree_id, title, url, note, sort_order)
       VALUES ('4-C-01', '11408', ?, ?, ?, ?)`,
      ref.title || '',
      ref.url || '',
      ref.note || '',
      i
    );
  }
}
