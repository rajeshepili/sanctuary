import { getDb } from '#/database'
import type { JournalMood } from '#/types'
import {
  journalEntries,
  entryMedia,
  habits,
  habitCompletions,
  habitCategories,
  userPreferences,
} from '#/database/schema'
import { EXPORT_VERSION } from './export.lib'
import type { findAllExportData } from './export.repository'
import { eq } from 'drizzle-orm'

export const FULL_BACKUP_VERSION = 2

export type BackupPayload = {
  version: number
  exportedAt: string
  entries: Awaited<ReturnType<typeof findAllExportData>>['entries']
  habits?: Awaited<ReturnType<typeof findAllExportData>>['habits']
  categories?: Awaited<ReturnType<typeof findAllExportData>>['categories']
  preferences?: Awaited<ReturnType<typeof findAllExportData>>['preferences']
}

const RESTORABLE_PREFERENCE_KEYS = [
  'name',
  'disclaimerAgreed',
  'latitude',
  'longitude',
  'locationLabel',
  'backupEnabled',
  'backupPath',
  'backupFrequency',
  'backupKeepCount',
  'layoutMode',
] as const

export function buildFullBackupPayload(
  data: Awaited<ReturnType<typeof findAllExportData>>,
): BackupPayload {
  return {
    version: FULL_BACKUP_VERSION,
    exportedAt: data.exportedAt,
    entries: data.entries,
    habits: data.habits,
    categories: data.categories,
    preferences: data.preferences,
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
      version:
        typeof obj.version === 'number' ? obj.version : FULL_BACKUP_VERSION,
      exportedAt:
        typeof obj.exportedAt === 'string'
          ? obj.exportedAt
          : new Date().toISOString(),
      entries: obj.entries as BackupPayload['entries'],
      habits: Array.isArray(obj.habits)
        ? (obj.habits as BackupPayload['habits'])
        : undefined,
      categories: Array.isArray(obj.categories)
        ? (obj.categories as BackupPayload['categories'])
        : undefined,
      preferences:
        obj.preferences && typeof obj.preferences === 'object'
          ? (obj.preferences as BackupPayload['preferences'])
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
      categories: Array.isArray(obj.categories)
        ? (obj.categories as BackupPayload['categories'])
        : undefined,
      preferences:
        obj.preferences && typeof obj.preferences === 'object'
          ? (obj.preferences as BackupPayload['preferences'])
          : undefined,
    }
  }

  throw new Error('Unrecognized backup format.')
}

export async function importBackupPayload(
  payload: BackupPayload,
  mode: 'merge' | 'replace',
): Promise<{ entriesImported: number; identitiesImported: number }> {
  const db = await getDb()

  let imported = 0
  let importedIdentities = 0

  await db.transaction(async (tx) => {
    if (mode === 'replace') {
      await tx.delete(entryMedia)
      await tx.delete(journalEntries)
      await tx.delete(habitCompletions)
      await tx.delete(habits)
      await tx.delete(habitCategories)
    }

    for (const entry of payload.entries) {
      const row = entry as Record<string, unknown>
      const createdAt = new Date(row.createdAt as string | number | Date)
      const updatedAt = new Date(
        (row.updatedAt as string | number | Date | undefined) ?? createdAt,
      )

      const [insertedEntry] = await tx
        .insert(journalEntries)
        .values({
          content: String(row.content ?? ''),
          tags: (row.tags as string | null) ?? null,
          isPinned: Boolean(row.isPinned),
          mood: (row.mood as JournalMood | null) ?? null,
          createdAt,
          updatedAt,
          deletedAt: row.deletedAt
            ? new Date(row.deletedAt as string | number)
            : null,
        })
        .returning({ id: journalEntries.id })

      imported++

      if (!Array.isArray(row.media)) continue

      for (const mediaRow of row.media as Array<Record<string, unknown>>) {
        await tx.insert(entryMedia).values({
          entryId: insertedEntry.id,
          filePath: String(mediaRow.filePath ?? ''),
          thumbnailPath: String(
            mediaRow.thumbnailPath ?? mediaRow.filePath ?? '',
          ),
          mimeType: String(mediaRow.mimeType ?? 'image/*'),
          fileSize: Number(mediaRow.fileSize ?? 0),
          createdAt: mediaRow.createdAt
            ? new Date(mediaRow.createdAt as string | number | Date)
            : createdAt,
        })
      }
    }

    if (Array.isArray(payload.categories)) {
      for (const category of payload.categories) {
        const row = category as Record<string, unknown>
        await tx
          .insert(habitCategories)
          .values({
            id: typeof row.id === 'number' ? row.id : undefined,
            name: String(row.name ?? '').trim() || 'Uncategorized',
          })
          .onConflictDoNothing()
      }
    }
    const availableCategoryIds = new Set(
      (payload.categories ?? [])
        .map((category) => (category as Record<string, unknown>).id)
        .filter((id): id is number => typeof id === 'number'),
    )

    if (Array.isArray(payload.habits)) {
      for (const habit of payload.habits) {
        const row = habit as Record<string, unknown>
        const rawCategoryId =
          typeof row.categoryId === 'number' ? row.categoryId : null
        const [insertedHabit] = await tx
          .insert(habits)
          .values({
            name: String(row.name ?? '').trim() || 'Untitled identity',
            identityLabel: (row.identityLabel as string | null) ?? null,
            miniDesc: (row.miniDesc as string | null) ?? null,
            plusDesc: (row.plusDesc as string | null) ?? null,
            eliteDesc: (row.eliteDesc as string | null) ?? null,
            frequency:
              (row.frequency as
                | 'daily'
                | 'weekly'
                | 'monthly'
                | 'custom'
                | undefined) ?? 'daily',
            interval: Math.max(1, Number(row.interval ?? 1)),
            daysOfWeek: Array.isArray(row.daysOfWeek)
              ? (row.daysOfWeek as number[])
              : null,
            targetCount:
              typeof row.targetCount === 'number' ? row.targetCount : null,
            priority:
              (row.priority as 'low' | 'medium' | 'high' | undefined) ??
              'medium',
            categoryId:
              rawCategoryId !== null &&
              (availableCategoryIds.size === 0 ||
                availableCategoryIds.has(rawCategoryId))
                ? rawCategoryId
                : null,
            status:
              (row.status as 'active' | 'resting' | undefined) ?? 'active',
            restUntil: row.restUntil
              ? new Date(row.restUntil as string | number | Date)
              : null,
            intention: (row.intention as string | null) ?? null,
            createdAt: row.createdAt
              ? new Date(row.createdAt as string | number | Date)
              : new Date(),
          })
          .returning({ id: habits.id })

        importedIdentities++

        if (!Array.isArray(row.completions)) continue

        for (const completion of row.completions as Array<
          Record<string, unknown>
        >) {
          await tx
            .insert(habitCompletions)
            .values({
              habitId: insertedHabit.id,
              completedAt: String(completion.completedAt ?? ''),
              tier:
                (completion.tier as
                  | 'mini'
                  | 'plus'
                  | 'elite'
                  | 'skipped'
                  | undefined) ?? 'plus',
            })
            .onConflictDoNothing()
        }
      }
    }

    if (payload.preferences && typeof payload.preferences === 'object') {
      const safePreferencePatch: Record<string, unknown> = {}
      for (const key of RESTORABLE_PREFERENCE_KEYS) {
        if (key in payload.preferences) {
          safePreferencePatch[key] = (
            payload.preferences as Record<string, unknown>
          )[key]
        }
      }

      if (Object.keys(safePreferencePatch).length > 0) {
        await tx
          .update(userPreferences)
          .set(safePreferencePatch)
          .where(eq(userPreferences.id, 1))
      }
    }
  })

  return { entriesImported: imported, identitiesImported: importedIdentities }
}
