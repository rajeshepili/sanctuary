/**
 * Applies the current SQLite schema for in-memory tests.
 * Kept in sync with drizzle migrations under /drizzle.
 */
export const TEST_SCHEMA_STATEMENTS = [
  `CREATE TABLE journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      isPinned INTEGER DEFAULT 0 NOT NULL,
      mood TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      deleted_at INTEGER
    )`,
  `CREATE TABLE entry_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      entry_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      thumbnail_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
    )`,
  `CREATE TABLE habit_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL
  )`,
  `CREATE TABLE habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      identity_label TEXT,
      mini_desc TEXT,
      plus_desc TEXT,
      elite_desc TEXT,
      frequency TEXT DEFAULT 'daily' NOT NULL,
      interval INTEGER DEFAULT 1 NOT NULL,
      days_of_week TEXT,
      target_count INTEGER,
      priority TEXT DEFAULT 'medium' NOT NULL,
      category_id INTEGER,
      status TEXT DEFAULT 'active' NOT NULL,
      rest_until INTEGER,
      intention TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (category_id) REFERENCES habit_categories(id) ON DELETE SET NULL
    )`,
  `CREATE TABLE habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      habit_id INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      tier TEXT DEFAULT 'plus' NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )`,
  `CREATE TABLE user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT,
      onboarded_at INTEGER,
      disclaimerAgreed INTEGER DEFAULT 0 NOT NULL,
      privacy_pin TEXT,
      latitude REAL,
      longitude REAL,
      location_label TEXT,
      sync_directory TEXT,
      sync_passphrase_hash TEXT,
      last_synced_at INTEGER,
      backup_enabled INTEGER DEFAULT 1 NOT NULL,
      backup_path TEXT,
      backup_frequency TEXT DEFAULT 'daily' NOT NULL,
      last_backup_at INTEGER,
      backup_keep_count INTEGER DEFAULT 30 NOT NULL,
      layout_mode TEXT DEFAULT 'standard' NOT NULL
    )`,
  `CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_journal_entries_deleted_at ON journal_entries(deleted_at)`,
  `CREATE INDEX IF NOT EXISTS idx_entry_media_entry_id ON entry_media(entry_id)`,
  `CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id)`,
  `CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at)`,
] as const

export const TEST_SCHEMA_SQL = TEST_SCHEMA_STATEMENTS.join(';\n') + ';'

export function applyTestSchema(exec: (sql: string) => void) {
  for (const sql of TEST_SCHEMA_STATEMENTS) {
    exec(sql)
  }
}

export async function applyTestSchemaAsync(
  run: (sql: string) => Promise<unknown>,
) {
  await run(TEST_SCHEMA_SQL)
}
