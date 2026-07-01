import { getDb } from '#/database'
import { journalEntries, entryMedia } from '#/database/schema'
import {
  deleteMediaAssets,
  prepareMediaAsset,
} from '#/infrastructure/media/media.processor'
import { eq, desc, isNull, isNotNull, inArray, and } from 'drizzle-orm'
import type {
  CreateEntryInput,
  UpdateEntryInput,
  TogglePinInput,
  DeleteEntryInput,
  GetEntryInput,
  ListEntriesInput,
} from './journal.schema'
import { JournalError } from './journal.errors'
import type { Entry } from '#/types'
import { getFirstOrThrow, ensureRowsAffected } from '#/database/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTags(content: string): string | null {
  const matches = content.match(/#[a-zA-Z0-9_-]+/g)
  if (!matches) return null
  const unique = Array.from(
    new Set(matches.map((t) => t.slice(1).toLowerCase())),
  )
  return unique.length > 0 ? unique.join(',') : null
}

const WITH_MEDIA_COLUMNS = {
  media: {
    columns: {
      id: true,
      entryId: true,
      filePath: true,
      thumbnailPath: true,
      mimeType: true,
      fileSize: true,
      createdAt: true,
    },
  },
} as const

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function findAll(): Promise<Entry[]> {
  const db = await getDb()

  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.isPinned), desc(journalEntries.createdAt)],
    limit: 100,
  })

  return entries
}

export async function list(data: ListEntriesInput): Promise<{
  items: Entry[]
  nextCursor: number | null
}> {
  const db = await getDb()
  const { cursor = 0, limit } = data

  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNull(journalEntries.deletedAt),
    orderBy: [
      desc(journalEntries.isPinned),
      desc(journalEntries.createdAt),
      desc(journalEntries.id),
    ],
    limit: limit + 1,
    offset: cursor,
  })

  let nextCursor: number | null = null
  if (entries.length > limit) {
    entries.pop()
    nextCursor = cursor + limit
  }

  return { items: entries, nextCursor }
}

export async function findById(
  data: GetEntryInput,
): Promise<Entry | null> {
  const db = await getDb()

  const entry = await db.query.journalEntries.findFirst({
    with: WITH_MEDIA_COLUMNS,
    where: eq(journalEntries.id, data.id),
  })

  return entry ?? null
}

export async function findTrash(): Promise<Entry[]> {
  const db = await getDb()

  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNotNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.deletedAt)],
    limit: 200,
  })

  return entries
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function create(
  data: CreateEntryInput,
): Promise<Entry> {
  const db = await getDb()
  const trimmed = data.content.trim()

  const preparedMedia = await Promise.all(
    data.media.map((m) => prepareMediaAsset(m.base64Data)),
  )

  try {
    const createdEntry = await db.transaction(async (tx) => {
      const results = await tx
        .insert(journalEntries)
        .values({
          content: trimmed,
          tags: extractTags(trimmed),
          mood: data.mood ?? null,
        })
        .returning()

      const entry = getFirstOrThrow(
        results,
        new JournalError(
          'JOURNAL_CREATE_FAILED',
          'Failed to create journal entry',
        ),
      )

      const insertedMedia = preparedMedia.length
        ? await tx
            .insert(entryMedia)
            .values(
              preparedMedia.map((m) => ({
                entryId: entry.id,
                filePath: m.filePath,
                thumbnailPath: m.thumbnailPath,
                mimeType: m.mimeType,
                fileSize: m.fileSize,
              })),
            )
            .returning()
        : []

      return { ...entry, media: insertedMedia }
    })

    return createdEntry
  } catch (error) {
    await deleteMediaAssets(preparedMedia)
    if (error instanceof JournalError) throw error
    throw new JournalError(
      'JOURNAL_CREATE_FAILED',
      'Failed to create journal entry',
      { cause: error },
    )
  }
}

export async function update(
  data: UpdateEntryInput,
): Promise<Entry> {
  const db = await getDb()
  const trimmed = data.content.trim()

  const preparedMedia = await Promise.all(
    data.addedMedia.map((m) => prepareMediaAsset(m.base64Data)),
  )

  // Collect file paths to delete AFTER the transaction commits
  const pathsToDelete: { filePath: string; thumbnailPath: string }[] = []

  try {
    const updated = await db.transaction(async (tx) => {
      // 1. Update the entry row
      const updateResults = await tx
        .update(journalEntries)
        .set({
          content: trimmed,
          tags: extractTags(trimmed),
          mood: data.mood ?? null,
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, data.id))
        .returning()

      getFirstOrThrow(
        updateResults,
        new JournalError('JOURNAL_NOT_FOUND', `Entry ${data.id} not found`, {
          status: 404,
        }),
      )

      // 2. Remove requested media
      if (data.removedMediaIds.length > 0) {
        const toRemove = await tx.query.entryMedia.findMany({
          where: inArray(entryMedia.id, data.removedMediaIds),
        })

        if (toRemove.length > 0) {
          await tx.delete(entryMedia).where(
            inArray(
              entryMedia.id,
              toRemove.map((m) => m.id),
            ),
          )
          for (const m of toRemove) {
            pathsToDelete.push({
              filePath: m.filePath,
              thumbnailPath: m.thumbnailPath,
            })
          }
        }
      }

      // 3. Insert new media
      if (preparedMedia.length > 0) {
        await tx.insert(entryMedia).values(
          preparedMedia.map((m) => ({
            entryId: data.id,
            filePath: m.filePath,
            thumbnailPath: m.thumbnailPath,
            mimeType: m.mimeType,
            fileSize: m.fileSize,
          })),
        )
      }

      // 4. Fetch the final state inside the transaction
      const finalEntry = await tx.query.journalEntries.findFirst({
        where: eq(journalEntries.id, data.id),
        with: { media: true },
      })

      if (!finalEntry) {
        throw new JournalError(
          'JOURNAL_UPDATE_FAILED',
          'Failed to retrieve entry after update',
        )
      }

      return finalEntry
    })

    // Delete files only after the DB transaction has committed successfully
    if (pathsToDelete.length > 0) {
      await deleteMediaAssets(pathsToDelete)
    }

    return updated
  } catch (error) {
    // Roll back newly prepared disk assets
    await deleteMediaAssets(preparedMedia)
    if (error instanceof JournalError) throw error
    throw new JournalError(
      'JOURNAL_UPDATE_FAILED',
      'Failed to update journal entry',
      { cause: error },
    )
  }
}

export async function togglePin(data: TogglePinInput): Promise<Entry> {
  const db = await getDb()

  return db.transaction(async (tx) => {
    const entry = await tx.query.journalEntries.findFirst({
      where: eq(journalEntries.id, data.id),
    })

    if (!entry) {
      throw new JournalError(
        'JOURNAL_NOT_FOUND',
        `Entry ${data.id} not found`,
        { status: 404 },
      )
    }

    const updateResults = await tx
      .update(journalEntries)
      .set({ isPinned: !entry.isPinned })
      .where(eq(journalEntries.id, data.id))
      .returning()

    ensureRowsAffected(
      updateResults,
      new JournalError('JOURNAL_TOGGLE_PIN_FAILED', 'Failed to toggle pin'),
    )

    const pinned = await tx.query.journalEntries.findFirst({
      where: eq(journalEntries.id, data.id),
      with: WITH_MEDIA_COLUMNS,
    })

    return pinned!
  })
}

export async function remove(
  data: DeleteEntryInput,
): Promise<void> {
  const db = await getDb()

  await db.transaction(async (tx) => {
    const updateResults = await tx
      .update(journalEntries)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(journalEntries.id, data.id), isNull(journalEntries.deletedAt)),
      )
      .returning({ id: journalEntries.id })

    ensureRowsAffected(
      updateResults,
      new JournalError('JOURNAL_NOT_FOUND', `Entry ${data.id} not found`, {
        status: 404,
      }),
    )
  })
}

export async function restore(
  id: number,
): Promise<{ id: number }> {
  const db = await getDb()

  return db.transaction(async (tx) => {
    const updateResults = await tx
      .update(journalEntries)
      .set({ deletedAt: null })
      .where(
        and(eq(journalEntries.id, id), isNotNull(journalEntries.deletedAt)),
      )
      .returning({ id: journalEntries.id })

    return getFirstOrThrow(
      updateResults,
      new JournalError('JOURNAL_NOT_FOUND', `Entry ${id} not found`, {
        status: 404,
      }),
    )
  })
}

export async function permanentRemove(id: number): Promise<void> {
  const db = await getDb()

  let mediaToDelete: { filePath: string; thumbnailPath: string }[] = []

  await db.transaction(async (tx) => {
    // Fetch media before deletion so we can clean up disk assets
    const entry = await tx.query.journalEntries.findFirst({
      with: { media: true },
      where: and(
        eq(journalEntries.id, id),
        isNotNull(journalEntries.deletedAt),
      ),
    })

    if (!entry) return

    mediaToDelete = entry.media.map((m) => ({
      filePath: m.filePath,
      thumbnailPath: m.thumbnailPath,
    }))

    // Cascade: DB will handle entryMedia via FK if set up, but we do it
    // explicitly for clarity and safety
    if (entry.media.length > 0) {
      await tx.delete(entryMedia).where(
        inArray(
          entryMedia.id,
          entry.media.map((m) => m.id),
        ),
      )
    }

    await tx.delete(journalEntries).where(eq(journalEntries.id, id))
  })

  // Delete disk assets only after DB transaction commits
  if (mediaToDelete.length > 0) {
    await deleteMediaAssets(mediaToDelete)
  }
}
