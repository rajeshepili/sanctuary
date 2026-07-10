import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createIsolatedTestDatabase } from '#/test/database'
import { getDb, setDb, shutdownDatabase } from '#/database'
import * as schema from '#/database/schema'
import {
  FULL_BACKUP_VERSION,
  importBackupPayload,
  parseBackupPayload,
} from './export.import'

describe('export import restore semantics', () => {
  beforeEach(async () => {
    const db = await createIsolatedTestDatabase()
    setDb(db)
    await db.insert(schema.userPreferences).values({
      id: 1,
      name: 'Original User',
      disclaimerAgreed: false,
      privacyPin: 'hashed-pin',
      backupFrequency: 'daily',
      layoutMode: 'standard',
    })
  })

  afterEach(async () => {
    await shutdownDatabase()
  })

  it('restores full payload and applies only safe preferences', async () => {
    const payload = {
      version: FULL_BACKUP_VERSION,
      exportedAt: '2026-06-01T00:00:00.000Z',
      entries: [
        {
          content: 'restored entry',
          tags: 'focus',
          isPinned: true,
          mood: 'calm',
          createdAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-01T00:00:00.000Z',
          deletedAt: null,
          media: [
            {
              filePath: '/media/photo.webp',
              thumbnailPath: '/media/photo-thumb.webp',
              mimeType: 'image/webp',
              fileSize: 1234,
              createdAt: '2026-06-01T00:00:00.000Z',
            },
          ],
        },
      ],
      categories: [{ id: 10, name: 'Mindset' }],
      habits: [
        {
          name: 'Practice gratitude',
          frequency: 'daily',
          interval: 1,
          priority: 'medium',
          status: 'active',
          categoryId: 10,
          createdAt: '2026-06-01T00:00:00.000Z',
          completions: [{ completedAt: '2026-06-02', tier: 'plus' }],
        },
      ],
      preferences: {
        name: 'Restored User',
        disclaimerAgreed: true,
        backupFrequency: 'weekly',
        layoutMode: 'immersive',
        privacyPin: 'should-not-be-restored',
      },
    }

    const result = await importBackupPayload(payload as never, 'replace')
    expect(result).toEqual({ entriesImported: 1, identitiesImported: 1 })

    const db = await getDb()
    const [entry] = await db.select().from(schema.journalEntries)
    const [media] = await db.select().from(schema.entryMedia)
    const [identity] = await db.select().from(schema.habits)
    const [completion] = await db.select().from(schema.habitCompletions)
    const [prefs] = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.id, 1))

    expect(entry.content).toBe('restored entry')
    expect(media.filePath).toBe('/media/photo.webp')
    expect(identity.name).toBe('Practice gratitude')
    expect(identity.categoryId).toBe(10)
    expect(completion.completedAt).toBe('2026-06-02')
    expect(prefs.name).toBe('Restored User')
    expect(prefs.backupFrequency).toBe('weekly')
    expect(prefs.layoutMode).toBe('immersive')
    expect(prefs.privacyPin).toBe('hashed-pin')
  })

  it('parses legacy payload without identities', () => {
    const legacy = parseBackupPayload({
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      entries: [],
    })

    expect(legacy.entries).toEqual([])
    expect(legacy.habits).toBeUndefined()
    expect(legacy.categories).toBeUndefined()
  })
})
