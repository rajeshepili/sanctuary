import { getDb } from '#/database'
import { journalEntries, habits } from '#/database/schema'
import { createServerFn } from '@tanstack/react-start'
import { desc, isNull } from 'drizzle-orm'
import {
  buildExportJsonPayload,
  buildExportMarkdown,
} from './journal.export.lib'

async function getEntriesForExport() {
  const db = await getDb()
  return db.query.journalEntries.findMany({
    with: { media: true },
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.createdAt)],
  })
}

export const exportAllData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const allEntries = await getEntriesForExport()
    return buildExportJsonPayload(allEntries, new Date().toISOString())
  },
)

export const exportMarkdown = createServerFn({ method: 'GET' }).handler(
  async () => {
    const allEntries = await getEntriesForExport()
    return buildExportMarkdown(allEntries)
  },
)

export const getExportData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const db = await getDb()
    
    const entries = await db.query.journalEntries.findMany({
      with: { media: true },
      where: isNull(journalEntries.deletedAt),
      orderBy: [desc(journalEntries.createdAt)],
    })

    const allHabits = await db.query.habits.findMany({
      with: { completions: true },
      orderBy: [desc(habits.createdAt)],
    })

    const prefs = await db.query.userPreferences.findFirst()

    return {
      entries,
      habits: allHabits,
      preferences: prefs,
      exportedAt: new Date().toISOString(),
    }
  },
)
