import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { eq, isNull } from 'drizzle-orm'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import * as schema from '#/database/schema'
import { createIsolatedTestDatabase } from '#/test/database'
import { seedJournalEntry, seedMedia } from '#/test/db-seed'
import { purgeOrphanedMediaFiles, purgeStaleEntries } from '#/database/purge'

describe('purgeStaleEntries', () => {
  let db: LibSQLDatabase<typeof schema>
  let mediaDir: string

  beforeEach(async () => {
    db = await createIsolatedTestDatabase()
    mediaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sanctuary-purge-'))
    process.env.MEDIA_STORAGE_PATH = mediaDir
  })

  afterEach(async () => {
    delete process.env.MEDIA_STORAGE_PATH
    await fs.remove(mediaDir).catch(() => {})
  })

  it('keeps entries within the 30-day trash grace period', async () => {
    const recent = new Date()
    recent.setDate(recent.getDate() - 10)

    const entry = await seedJournalEntry(db, { deletedAt: recent })

    await purgeStaleEntries(db)

    const remaining = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
    })

    expect(remaining).toBeDefined()
  })

  it('permanently deletes entries older than the grace period', async () => {
    const staleDate = new Date()
    staleDate.setDate(staleDate.getDate() - 31)

    const entry = await seedJournalEntry(db, { deletedAt: staleDate })
    const mediaPath = path.join(mediaDir, 'stale.webp')
    const thumbPath = path.join(mediaDir, 'stale_thumb.webp')
    await fs.writeFile(mediaPath, 'webp')
    await fs.writeFile(thumbPath, 'webp')
    await seedMedia(db, entry.id, {
      filePath: mediaPath,
      thumbnailPath: thumbPath,
    })

    await purgeStaleEntries(db)

    const remaining = await db.query.journalEntries.findFirst({
      where: eq(schema.journalEntries.id, entry.id),
    })
    const activeEntries = await db.query.journalEntries.findMany({
      where: isNull(schema.journalEntries.deletedAt),
    })

    expect(remaining).toBeUndefined()
    expect(activeEntries).toHaveLength(0)
    expect(await fs.pathExists(mediaPath)).toBe(false)
    expect(await fs.pathExists(thumbPath)).toBe(false)
  })
})

describe('purgeOrphanedMediaFiles', () => {
  let db: LibSQLDatabase<typeof schema>
  let mediaDir: string

  beforeEach(async () => {
    db = await createIsolatedTestDatabase()
    mediaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sanctuary-orphan-'))
    process.env.MEDIA_STORAGE_PATH = mediaDir
  })

  afterEach(async () => {
    delete process.env.MEDIA_STORAGE_PATH
    await fs.remove(mediaDir).catch(() => {})
  })

  it('removes webp files on disk that have no database record', async () => {
    const entry = await seedJournalEntry(db)
    const knownPath = path.join(mediaDir, 'known.webp')
    const knownThumb = path.join(mediaDir, 'known_thumb.webp')
    const orphanPath = path.join(mediaDir, 'orphan.webp')

    await fs.writeFile(knownPath, 'webp')
    await fs.writeFile(knownThumb, 'webp')
    await fs.writeFile(orphanPath, 'webp')
    await seedMedia(db, entry.id, {
      filePath: knownPath,
      thumbnailPath: knownThumb,
    })

    await purgeOrphanedMediaFiles(db)

    expect(await fs.pathExists(orphanPath)).toBe(false)
    expect(await fs.pathExists(knownPath)).toBe(true)
    expect(await fs.pathExists(knownThumb)).toBe(true)
  })
})
