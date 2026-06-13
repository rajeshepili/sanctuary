import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from '#/database/schema'
import {
  createCustomPromptFixture,
  createEntryFixture,
  createHabitCompletionFixture,
  createHabitFixture,
  createMediaFixture,
  createUserPreferencesFixture,
} from '#/test/fixtures'

type TestDb = LibSQLDatabase<typeof schema>

function requireRow<T>(row: T | undefined, label: string): T {
  if (row === undefined) {
    throw new Error(`Expected ${label} insert to return a row`)
  }
  return row
}

export async function seedJournalEntry(
  db: TestDb,
  overrides?: Parameters<typeof createEntryFixture>[0],
) {
  const [entry] = await db
    .insert(schema.journalEntries)
    .values(createEntryFixture(overrides))
    .returning()
  return requireRow(entry, 'journal entry')
}

export async function seedMedia(
  db: TestDb,
  entryId: number,
  overrides?: Parameters<typeof createMediaFixture>[1],
) {
  const [media] = await db
    .insert(schema.entryMedia)
    .values(createMediaFixture(entryId, overrides))
    .returning()
  return requireRow(media, 'entry media')
}

export async function seedHabit(
  db: TestDb,
  overrides?: Parameters<typeof createHabitFixture>[0],
) {
  const [habit] = await db
    .insert(schema.habits)
    .values(createHabitFixture(overrides))
    .returning()
  return requireRow(habit, 'habit')
}

export async function seedHabitCompletion(
  db: TestDb,
  habitId: number,
  overrides?: Parameters<typeof createHabitCompletionFixture>[1],
) {
  const [completion] = await db
    .insert(schema.habitCompletions)
    .values(createHabitCompletionFixture(habitId, overrides))
    .returning()
  return requireRow(completion, 'habit completion')
}

export async function seedPreferences(
  db: TestDb,
  overrides?: Parameters<typeof createUserPreferencesFixture>[0],
) {
  const [prefs] = await db
    .insert(schema.userPreferences)
    .values(createUserPreferencesFixture(overrides))
    .returning()
  return requireRow(prefs, 'user preferences')
}

export async function seedPrompt(
  db: TestDb,
  overrides?: Parameters<typeof createCustomPromptFixture>[0],
) {
  const [prompt] = await db
    .insert(schema.customPrompts)
    .values(createCustomPromptFixture(overrides))
    .returning()
  return requireRow(prompt, 'custom prompt')
}
