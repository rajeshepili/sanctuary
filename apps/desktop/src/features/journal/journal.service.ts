import { getDb } from '#/database'
import { journalEntries, entryMedia } from '#/database/schema'
import { prepareMediaAsset } from '#/features/media/media.service'
import { eq, desc, isNull, isNotNull, inArray } from 'drizzle-orm'
import fs from 'fs-extra'
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

function extractTags(content: string): string | null {
  const matches = content.match(/#[a-zA-Z0-9-]+/g)
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

export async function getAllEntriesService(): Promise<Entry[]> {
  const db = await getDb()

  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.isPinned), desc(journalEntries.createdAt)],
    limit: 100,
  })

  return entries
}

export async function listEntriesService(data: ListEntriesInput): Promise<{
  items: Entry[]
  nextCursor: number | null
}> {
  const db = await getDb()
  const { cursor = 0, limit } = data

  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.isPinned), desc(journalEntries.createdAt), desc(journalEntries.id)],
    limit: limit + 1,
    offset: cursor,
  })

  let nextCursor: number | null = null
  if (entries.length > limit) {
    entries.pop()
    nextCursor = cursor + limit
  }

  return {
    items: entries,
    nextCursor,
  }
}

export async function getEntryService(data: GetEntryInput): Promise<Entry | null> {
  const db = await getDb()

  const entry = await db.query.journalEntries.findFirst({
    with: WITH_MEDIA_COLUMNS,
    where: eq(journalEntries.id, data.id),
  })

  return entry || null
}

export async function getDeletedEntriesService(): Promise<Entry[]> {
  const db = await getDb()
  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNotNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.deletedAt)],
    limit: 100,
  })

  return entries
}

export async function createEntryService(data: CreateEntryInput): Promise<Entry> {
  const db = await getDb()
  const preparedMedia = await Promise.all(
    data.media.map((media) => prepareMediaAsset(media.base64Data)),
  )

  try {
    const createdEntry = await db.transaction(async (tx) => {
      const [entry] = await tx
        .insert(journalEntries)
        .values({
          content: data.content.trim(),
          tags: extractTags(data.content),
        })
        .returning()

      if (!entry) {
        throw new JournalError('JOURNAL_CREATE_FAILED', 'Failed to create journal entry')
      }

      const insertedMedia = preparedMedia.length
        ? await tx
          .insert(entryMedia)
          .values(
            preparedMedia.map((media) => ({
              entryId: entry.id,
              filePath: media.filePath,
              thumbnailPath: media.thumbnailPath,
              mimeType: media.mimeType,
              fileSize: media.fileSize,
            })),
          )
          .returning()
        : []

      return {
        ...entry,
        media: insertedMedia,
      }
    })

    return createdEntry
  } catch (error) {
    await Promise.allSettled(
      preparedMedia.map((media) =>
        Promise.all([
          fs.remove(media.filePath),
          fs.remove(media.thumbnailPath),
        ]),
      ),
    )
    if (error instanceof JournalError) throw error
    throw new JournalError('JOURNAL_CREATE_FAILED', 'Failed to create journal entry', { cause: error })
  }
}

export async function updateEntryService(data: UpdateEntryInput): Promise<Entry> {
  const db = await getDb()

  const preparedMedia = await Promise.all(
    data.addedMedia.map((media) => prepareMediaAsset(media.base64Data)),
  )
  try {
    let pathsToRemove: string[] = []

    const updatedWithMedia = await db.transaction(async (tx) => {
      const updateResults = await tx
        .update(journalEntries)
        .set({
          content: data.content,
          tags: extractTags(data.content),
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, data.id))
        .returning()

      if (updateResults.length === 0) {
        throw new JournalError('JOURNAL_NOT_FOUND', `Entry with id ${data.id} not found`, { status: 404 })
      }

      const entry = updateResults[0]

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
            pathsToRemove.push(m.filePath, m.thumbnailPath)
          }
        }
      }

      if (preparedMedia.length > 0) {
        await tx.insert(entryMedia).values(
          preparedMedia.map((media) => ({
            entryId: entry.id,
            filePath: media.filePath,
            thumbnailPath: media.thumbnailPath,
            mimeType: media.mimeType,
            fileSize: media.fileSize,
          })),
        )
      }

      const finalEntry = await tx.query.journalEntries.findFirst({
        where: eq(journalEntries.id, entry.id),
        with: { media: true },
      })

      if (!finalEntry) {
        throw new JournalError('JOURNAL_UPDATE_FAILED', 'Failed to retrieve entry after update')
      }

      return finalEntry
    })

    // Remove files ONLY after the transaction has successfully committed
    for (const path of pathsToRemove) {
      if (path) await fs.remove(path).catch(() => { })
    }

    return updatedWithMedia
  } catch (error) {
    await Promise.allSettled(
      preparedMedia.map((media) =>
        Promise.all([
          fs.remove(media.filePath),
          fs.remove(media.thumbnailPath),
        ]),
      ),
    )
    if (error instanceof JournalError) throw error
    throw new JournalError('JOURNAL_UPDATE_FAILED', 'Failed to update journal entry', { cause: error })
  }
}

export async function togglePinService(data: TogglePinInput): Promise<Entry> {
  const db = await getDb()

  return db.transaction(async (tx) => {
    const entry = await tx.query.journalEntries.findFirst({
      where: eq(journalEntries.id, data.id),
    })

    if (!entry) {
      throw new JournalError('JOURNAL_NOT_FOUND', `Entry with id ${data.id} not found`, { status: 404 })
    }

    const updateResults = await tx
      .update(journalEntries)
      .set({ isPinned: !entry.isPinned })
      .where(eq(journalEntries.id, data.id))
      .returning()

    if (updateResults.length === 0) {
      throw new JournalError('JOURNAL_TOGGLE_PIN_FAILED', 'Failed to toggle pin')
    }

    const pinnedEntry = await tx.query.journalEntries.findFirst({
      where: eq(journalEntries.id, data.id),
      with: WITH_MEDIA_COLUMNS,
    })

    return pinnedEntry!
  })
}

export async function deleteEntryService(
  data: DeleteEntryInput,
): Promise<void> {
  const db = await getDb()
  const { id } = data

  await db.transaction(async (tx) => {
    const updateResults = await tx
      .update(journalEntries)
      .set({ deletedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning({ id: journalEntries.id })

    if (updateResults.length === 0) {
      throw new JournalError('JOURNAL_NOT_FOUND', `Entry with id ${id} not found`, { status: 404 })
    }
  })
}

export async function undeleteEntryService(
  id: number,
): Promise<{ id: number }> {
  const db = await getDb()

  return db.transaction(async (tx) => {
    const updateResults = await tx
      .update(journalEntries)
      .set({ deletedAt: null })
      .where(eq(journalEntries.id, id))
      .returning({ id: journalEntries.id })

    if (updateResults.length === 0) {
      throw new JournalError('JOURNAL_NOT_FOUND', `Entry with id ${id} not found`, { status: 404 })
    }

    return updateResults[0]
  })
}

export async function permanentDeleteEntryService(id: number): Promise<void> {
  const db = await getDb()

  const entry = await db.query.journalEntries.findFirst({
    with: { media: true },
    where: eq(journalEntries.id, id),
  })

  if (!entry) return

  await db.delete(journalEntries).where(eq(journalEntries.id, id))

  for (const m of entry.media) {
    await fs.remove(m.filePath).catch(() => { })
    await fs.remove(m.thumbnailPath).catch(() => { })
  }
}
