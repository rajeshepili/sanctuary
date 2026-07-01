import { getDb } from '#/database'
import { journalEntries, habits } from '#/database/schema'
import { desc, isNull } from 'drizzle-orm'

/**
 * Reads all data needed for a full export/backup.
 * This is a cross-feature query — it intentionally spans journal, habits,
 * and preferences because export is a cross-cutting concern.
 */
export async function findAllExportData() {
  const db = await getDb()

  const [entries, allHabits, prefs] = await Promise.all([
    db.query.journalEntries.findMany({
      with: { media: true },
      where: isNull(journalEntries.deletedAt),
      orderBy: [desc(journalEntries.createdAt)],
    }),
    db.query.habits.findMany({
      with: { completions: true },
      orderBy: [desc(habits.createdAt)],
    }),
    db.query.userPreferences.findFirst(),
  ])

  return {
    entries,
    habits: allHabits,
    preferences: prefs,
    exportedAt: new Date().toISOString(),
  }
}

export async function findEntriesForExport() {
  const db = await getDb()
  return db.query.journalEntries.findMany({
    with: { media: true },
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.createdAt)],
  })
}
