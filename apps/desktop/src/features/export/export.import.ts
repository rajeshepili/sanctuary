import { getDb } from '#/database'
import type { JournalMood } from '#/types'
import { journalEntries } from '#/database/schema'
import { EXPORT_VERSION } from './export.lib'
import type { findAllExportData } from './export.repository'

export const FULL_BACKUP_VERSION = 2

export type BackupPayload = {
  version: number
  exportedAt: string
  entries: Awaited<ReturnType<typeof findAllExportData>>['entries']
  habits?: Awaited<ReturnType<typeof findAllExportData>>['habits']
}

export function buildFullBackupPayload(
  data: Awaited<ReturnType<typeof findAllExportData>>,
): BackupPayload {
  return {
    version: FULL_BACKUP_VERSION,
    exportedAt: data.exportedAt,
    entries: data.entries,
    habits: data.habits,
  }
}

export function parseBackupPayload(raw: unknown): BackupPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid backup file.')
  }

  const obj = raw as Record<string, unknown>

  // Legacy v1 journal-only export
  if (obj.version === EXPORT_VERSION && Array.isArray(obj.entries)) {
    return {
      version: EXPORT_VERSION,
      exportedAt:
        typeof obj.exportedAt === 'string'
          ? obj.exportedAt
          : new Date().toISOString(),
      entries: obj.entries as BackupPayload['entries'],
    }
  }

  if (
    (obj.version === FULL_BACKUP_VERSION || obj.version === 1) &&
    Array.isArray(obj.entries)
  ) {
    return {
      version: typeof obj.version === 'number' ? obj.version : FULL_BACKUP_VERSION,
      exportedAt:
        typeof obj.exportedAt === 'string'
          ? obj.exportedAt
          : new Date().toISOString(),
      entries: obj.entries as BackupPayload['entries'],
      habits: Array.isArray(obj.habits)
        ? (obj.habits as BackupPayload['habits'])
        : undefined,
    }
  }

  // Encrypted exports written before v2 used getExportData() without a version field
  if (Array.isArray(obj.entries) && typeof obj.exportedAt === 'string') {
    return {
      version: FULL_BACKUP_VERSION,
      exportedAt: obj.exportedAt,
      entries: obj.entries as BackupPayload['entries'],
      habits: Array.isArray(obj.habits)
        ? (obj.habits as BackupPayload['habits'])
        : undefined,
    }
  }

  throw new Error('Unrecognized backup format.')
}

export async function importBackupPayload(
  payload: BackupPayload,
  mode: 'merge' | 'replace',
): Promise<{ entriesImported: number }> {
  const db = await getDb()

  if (mode === 'replace') {
    await db.delete(journalEntries)
  }

  let imported = 0

  for (const entry of payload.entries) {
    const row = entry as Record<string, unknown>
    const createdAt = new Date(row.createdAt as string | number | Date)
    const updatedAt = new Date(
      (row.updatedAt as string | number | Date | undefined) ?? createdAt,
    )

    await db.insert(journalEntries).values({
      content: String(row.content ?? ''),
      tags: (row.tags as string | null) ?? null,
      isPinned: Boolean(row.isPinned),
      mood: (row.mood as JournalMood | null) ?? null,
      createdAt,
      updatedAt,
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string | number) : null,
    })
    imported++
  }

  return { entriesImported: imported }
}
