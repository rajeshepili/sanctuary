import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { desc, eq, isNull } from 'drizzle-orm'
import * as schema from '#/database/schema'
import { createTestDatabase, resetTestDatabase } from '#/test/database'
import { seedJournalEntry, seedMedia } from '#/test/db-seed'

describe('Journal Integration Tests', () => {
  let db: LibSQLDatabase<typeof schema>

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates and retrieves a journal entry', async () => {
    const created = await seedJournalEntry(db, {
      content: 'Hello world, this is my first entry',
    })

    const retrieved = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, created.id),
    })

    expect(retrieved?.content).toBe('Hello world, this is my first entry')
  })

  it('creates entry with media attachments', async () => {
    const entry = await seedJournalEntry(db)
    const media = await seedMedia(db, entry.id)

    const retrieved = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
      with: { media: true },
    })

    expect(retrieved?.media).toHaveLength(1)
    expect(retrieved?.media[0]?.id).toBe(media.id)
  })

  it('pins and unpins entries', async () => {
    const entry = await seedJournalEntry(db)

    await db
      .update(schema.journalEntries)
      .set({ isPinned: true })
      .where(eq(schema.journalEntries.id, entry.id))

    let updated = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
    })
    expect(updated?.isPinned).toBe(true)

    await db
      .update(schema.journalEntries)
      .set({ isPinned: false })
      .where(eq(schema.journalEntries.id, entry.id))

    updated = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
    })
    expect(updated?.isPinned).toBe(false)
  })

  it('soft-deletes entries', async () => {
    const entry = await seedJournalEntry(db)
    const deletedAt = new Date()

    await db
      .update(schema.journalEntries)
      .set({ deletedAt })
      .where(eq(schema.journalEntries.id, entry.id))

    const active = await db.query.journalEntries.findMany({
      where: isNull(schema.journalEntries.deletedAt),
    })
    expect(active).toHaveLength(0)

    const trashed = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
    })
    expect(trashed?.deletedAt).toBeInstanceOf(Date)
  })

  it('cascade deletes media when entry is hard-deleted', async () => {
    const entry = await seedJournalEntry(db)
    await seedMedia(db, entry.id)

    await db
      .delete(schema.journalEntries)
      .where(eq(schema.journalEntries.id, entry.id))

    const media = await db.query.entryMedia.findMany()
    expect(media).toHaveLength(0)
  })

  it('retrieves entries ordered by pin status and date', async () => {
    await seedJournalEntry(db, {
      content: 'Older unpinned',
      createdAt: new Date('2024-01-01'),
    })
    const pinned = await seedJournalEntry(db, {
      content: 'Pinned entry',
      isPinned: true,
      createdAt: new Date('2024-01-02'),
    })
    await seedJournalEntry(db, {
      content: 'Newer unpinned',
      createdAt: new Date('2024-01-03'),
    })

    const entries = await db.query.journalEntries.findMany({
      where: isNull(schema.journalEntries.deletedAt),
      orderBy: [
        desc(schema.journalEntries.isPinned),
        desc(schema.journalEntries.createdAt),
      ],
    })

    expect(entries[0]?.id).toBe(pinned.id)
  })

  it('excludes soft-deleted entries from active queries', async () => {
    await seedJournalEntry(db, { content: 'Active entry' })
    const deleted = await seedJournalEntry(db, { content: 'Deleted entry' })

    await db
      .update(schema.journalEntries)
      .set({ deletedAt: new Date() })
      .where(eq(schema.journalEntries.id, deleted.id))

    const active = await db.query.journalEntries.findMany({
      where: isNull(schema.journalEntries.deletedAt),
    })

    expect(active).toHaveLength(1)
    expect(active[0]?.content).toBe('Active entry')
  })
})
