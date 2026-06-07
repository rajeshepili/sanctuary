import { getDb } from '#/database'
import { journalEntries } from '#/database/schema'
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
