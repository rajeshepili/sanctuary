import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import * as schema from '#/database/schema'
import { createTestDatabase, resetTestDatabase } from '#/test/database'
import { seedJournalEntry, seedMedia } from '#/test/db-seed'

describe('Media Integration Tests', () => {
  let db: LibSQLDatabase<typeof schema>

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates media linked to a journal entry', async () => {
    const entry = await seedJournalEntry(db)
    const media = await seedMedia(db, entry.id, {
      filePath: '/media/photo.webp',
      mimeType: 'image/webp',
      fileSize: 2048,
    })

    const retrieved = await db.query.entryMedia.findFirst({
      where: eq(schema.entryMedia.id, media.id),
    })

    expect(retrieved?.entryId).toBe(entry.id)
    expect(retrieved?.filePath).toBe('/media/photo.webp')
    expect(retrieved?.mimeType).toBe('image/webp')
  })

  it('loads media with its parent entry', async () => {
    const entry = await seedJournalEntry(db, { content: 'Entry with photo' })
    await seedMedia(db, entry.id)

    const withMedia = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
      with: { media: true },
    })

    expect(withMedia?.media).toHaveLength(1)
    expect(withMedia?.media[0]?.entryId).toBe(entry.id)
  })

  it('deletes media independently', async () => {
    const entry = await seedJournalEntry(db)
    const media = await seedMedia(db, entry.id)

    await db.delete(schema.entryMedia).where(eq(schema.entryMedia.id, media.id))

    const remaining = await db.query.entryMedia.findMany()
    const entryStillExists = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
    })

    expect(remaining).toHaveLength(0)
    expect(entryStillExists).toBeDefined()
  })

  it('supports multiple media items per entry', async () => {
    const entry = await seedJournalEntry(db)
    await seedMedia(db, entry.id, { filePath: '/media/a.webp' })
    await seedMedia(db, entry.id, { filePath: '/media/b.webp' })

    const withMedia = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
      with: { media: true },
    })

    expect(withMedia?.media).toHaveLength(2)
  })
})
