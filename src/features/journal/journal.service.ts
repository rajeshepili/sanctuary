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
} from './journal.schema'

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
    },
  },
} as const

export async function getAllEntriesService() {
  const db = await getDb()

  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.isPinned), desc(journalEntries.createdAt)],
  })

  return entries
}

export async function getDeletedEntriesService() {
  const db = await getDb()
  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNotNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.deletedAt)],
    limit: 100,
  })

  return entries
}

export async function createEntryService(data: CreateEntryInput) {
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
    throw error
  }
}

export async function updateEntryService(data: UpdateEntryInput) {
  const db = await getDb()

  const preparedMedia = await Promise.all(
    data.addedMedia.map((media) => prepareMediaAsset(media.base64Data)),
  )

  try {
    return await db.transaction(async (tx) => {
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
        throw new Error('Entry not found')
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
            await fs.remove(m.filePath).catch(() => {})
            await fs.remove(m.thumbnailPath).catch(() => {})
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

      const updatedWithMedia = await tx.query.journalEntries.findFirst({
        where: eq(journalEntries.id, entry.id),
        with: { media: true },
      })

      return updatedWithMedia!
    })
  } catch (error) {
    await Promise.allSettled(
      preparedMedia.map((media) =>
        Promise.all([
          fs.remove(media.filePath),
          fs.remove(media.thumbnailPath),
        ]),
      ),
    )
    throw error
  }
}

export async function togglePinService(data: TogglePinInput) {
  const db = await getDb()

  return db.transaction(async (tx) => {
    const entry = await tx.query.journalEntries.findFirst({
      where: eq(journalEntries.id, data.id),
    })

    if (!entry) {
      throw new Error('Entry not found')
    }

    const updateResults = await tx
      .update(journalEntries)
      .set({ isPinned: !entry.isPinned })
      .where(eq(journalEntries.id, data.id))
      .returning()

    if (updateResults.length === 0) {
      throw new Error('Failed to toggle pin')
    }

    return updateResults[0]
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
      throw new Error('Entry not found')
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
      throw new Error('Entry not found')
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

  for (const m of entry.media) {
    await fs.remove(m.filePath).catch(() => {})
    await fs.remove(m.thumbnailPath).catch(() => {})
  }

  await db.delete(journalEntries).where(eq(journalEntries.id, id))
}
