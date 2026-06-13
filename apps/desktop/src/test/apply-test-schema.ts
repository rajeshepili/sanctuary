/**
 * Applies the current SQLite schema for in-memory tests.
 * Kept in sync with drizzle migrations under /drizzle.
 */
const TEST_SCHEMA_STATEMENTS = [
  `CREATE TABLE journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      isPinned INTEGER DEFAULT 0 NOT NULL,
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
  `CREATE TABLE habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      frequency TEXT DEFAULT 'every_day' NOT NULL,
      days_of_week TEXT,
      priority TEXT DEFAULT 'medium' NOT NULL,
      category TEXT DEFAULT 'growth' NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL,
      rest_until INTEGER,
      intention TEXT,
      current_streak INTEGER DEFAULT 0 NOT NULL,
      longest_streak INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )`,
  `CREATE TABLE habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      habit_id INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )`,
  `CREATE TABLE user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      first_name TEXT,
      onboarded_at INTEGER,
      disclaimerAgreed INTEGER DEFAULT 0 NOT NULL,
      showPromptInspire INTEGER DEFAULT 1 NOT NULL,
      showBreathingSpace INTEGER DEFAULT 1 NOT NULL,
      showHabits INTEGER DEFAULT 1 NOT NULL,
      showDailyIntention INTEGER DEFAULT 1 NOT NULL,
      privacy_pin TEXT,
      latitude REAL,
      longitude REAL,
      location_label TEXT
    )`,
  `CREATE TABLE custom_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )`,
  `CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_journal_entries_deleted_at ON journal_entries(deleted_at)`,
  `CREATE INDEX IF NOT EXISTS idx_entry_media_entry_id ON entry_media(entry_id)`,
  `CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id)`,
  `CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at)`,
] as const

export function applyTestSchema(exec: (sql: string) => void) {
  for (const sql of TEST_SCHEMA_STATEMENTS) {
    exec(sql)
  }
}

export async function applyTestSchemaAsync(
  run: (sql: string) => Promise<unknown>,
) {
  for (const sql of TEST_SCHEMA_STATEMENTS) {
    await run(sql)
  }
}
