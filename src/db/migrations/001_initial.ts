export const MIGRATION_001 = `
CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trees (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version     TEXT NOT NULL DEFAULT '1.0',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  tree_id          TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  daily_budget_min INTEGER NOT NULL DEFAULT 120,
  icon             TEXT NOT NULL DEFAULT '📚',
  color            TEXT NOT NULL DEFAULT '#F0F4FF',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  UNIQUE(tree_id, name)
);
CREATE INDEX IF NOT EXISTS idx_categories_tree ON categories(tree_id);

CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT NOT NULL,
  tree_id      TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  module       TEXT NOT NULL DEFAULT '',
  chapter      TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL,
  minutes      INTEGER NOT NULL DEFAULT 30,
  priority     INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
  decomposable INTEGER NOT NULL DEFAULT 0,
  trigger_type TEXT,
  is_custom    INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (id, tree_id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_tree ON tasks(tree_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(tree_id, category);
CREATE INDEX IF NOT EXISTS idx_tasks_trigger ON tasks(tree_id, trigger_type);

CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
  id, tree_id, title, module, chapter,
  content=tasks, content_rowid=rowid
);

CREATE TABLE IF NOT EXISTS prerequisites (
  task_id   TEXT NOT NULL,
  tree_id   TEXT NOT NULL,
  prereq_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tree_id, prereq_id),
  FOREIGN KEY (task_id, tree_id) REFERENCES tasks(id, tree_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prereqs_prereq ON prerequisites(prereq_id, tree_id);

CREATE TABLE IF NOT EXISTS subtasks (
  parent_id   TEXT NOT NULL,
  tree_id     TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  PRIMARY KEY (parent_id, tree_id, sort_order),
  FOREIGN KEY (parent_id, tree_id) REFERENCES tasks(id, tree_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress (
  task_id      TEXT NOT NULL,
  tree_id      TEXT NOT NULL,
  completed    INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  PRIMARY KEY (task_id, tree_id),
  FOREIGN KEY (task_id, tree_id) REFERENCES tasks(id, tree_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_progress_tree ON progress(tree_id);

CREATE TABLE IF NOT EXISTS time_records (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id       TEXT NOT NULL,
  tree_id       TEXT NOT NULL,
  record_date   TEXT NOT NULL,
  estimated_min INTEGER NOT NULL,
  actual_min    REAL NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (task_id, tree_id) REFERENCES tasks(id, tree_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_timerec_task ON time_records(task_id, tree_id);

CREATE TABLE IF NOT EXISTS knowledge_detail (
  task_id      TEXT NOT NULL,
  tree_id      TEXT NOT NULL,
  detail       TEXT NOT NULL DEFAULT '',
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (task_id, tree_id),
  FOREIGN KEY (task_id, tree_id) REFERENCES tasks(id, tree_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS knowledge_references (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id    TEXT NOT NULL,
  tree_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (task_id, tree_id) REFERENCES tasks(id, tree_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_refs_task ON knowledge_references(task_id, tree_id);
`;
