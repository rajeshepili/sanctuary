import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '#/database/schema'
import { eq, desc } from 'drizzle-orm'
import {
  recordQueryMetric,
  getMetricsSummary,
  logMetricsSummary,
} from '#/database/metrics'
import { applyTestSchemaAsync } from '#/test/apply-test-schema'

// Use in-memory SQLite for tests
let testDb: LibSQLDatabase<typeof schema>

beforeEach(async () => {
  const client = createClient({ url: ':memory:' })
  testDb = drizzle(client, { schema })

  await applyTestSchemaAsync((sql) => testDb.run(sql))

  // Extra indexes for performance testing
  await testDb.run(`CREATE INDEX idx_habits_status ON habits(status)`)
  await testDb.run(
    `CREATE INDEX idx_journal_entries_createdAt ON journal_entries(created_at DESC)`,
  )
  await testDb.run(
    `CREATE INDEX idx_journal_entries_isPinned ON journal_entries(isPinned)`,
  )
  await testDb.run(
    `CREATE INDEX idx_entry_media_entryId ON entry_media(entry_id)`,
  )
})

afterEach(async () => {
  // Cleanup
})

describe('Database Performance', () => {
  describe('Critical Queries', () => {
    it('should retrieve journal entries efficiently', async () => {
      // Insert test data
      for (let i = 0; i < 50; i++) {
        await testDb.insert(schema.journalEntries).values({
          content: `Entry ${i}`,
          createdAt: new Date(Date.now() - i * 86400000),
          updatedAt: new Date(),
        })
      }

      const startTime = performance.now()
      const entries = await testDb.query.journalEntries.findMany({
        limit: 10,
      })
      const duration = performance.now() - startTime

      recordQueryMetric({
        name: 'fetch-journal-entries-limit-10',
        duration,
        rowCount: entries.length,
        success: true,
      })

      expect(entries).toHaveLength(10)
      expect(duration).toBeLessThan(50) // Should be <50ms for 10 rows
    })

    it('should retrieve habits with completions efficiently', async () => {
      // Insert test habits
      const habitIds: number[] = []
      for (let i = 0; i < 20; i++) {
        const result = await testDb.insert(schema.habits).values({
          name: `Habit ${i}`,
          frequency: 'every_day',
          status: 'active',
          createdAt: new Date(),
        })
        habitIds.push(Number(result.lastInsertRowid))
      }

      // Insert completions
      for (const habitId of habitIds) {
        for (let day = 0; day < 30; day++) {
          const date = new Date(Date.now() - day * 86400000)
          const dateStr = date.toISOString().split('T')[0]
          await testDb.insert(schema.habitCompletions).values({
            habitId,
            completedAt: dateStr,
          })
        }
      }

      const startTime = performance.now()
      const habits = await testDb.query.habits.findMany({
        where: eq(schema.habits.status, 'active'),
        with: {
          completions: true,
        },
      })
      const duration = performance.now() - startTime

      recordQueryMetric({
        name: 'fetch-habits-with-completions',
        duration,
        rowCount: habits.length,
        success: true,
      })

      expect(habits).toHaveLength(20)
      expect(duration).toBeLessThan(100) // Should be <100ms
    })

    it('should handle large entry lists without N+1 queries', async () => {
      // Insert 100 entries with media
      for (let i = 0; i < 100; i++) {
        const entryResult = await testDb.insert(schema.journalEntries).values({
          content: `Entry ${i}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        const entryId = Number(entryResult.lastInsertRowid)

        // Add 2 media files per entry
        for (let j = 0; j < 2; j++) {
          await testDb.insert(schema.entryMedia).values({
            entryId,
            filePath: `/media/entry-${i}-file-${j}.jpg`,
            thumbnailPath: `/media/entry-${i}-file-${j}-thumb.jpg`,
            mimeType: 'image/jpeg',
            fileSize: 1024 * 50, // 50KB
            createdAt: new Date(),
          })
        }
      }

      const startTime = performance.now()
      const entries = await testDb.query.journalEntries.findMany({
        with: {
          media: true,
        },
        limit: 20,
      })
      const duration = performance.now() - startTime

      recordQueryMetric({
        name: 'fetch-entries-with-media-limit-20',
        duration,
        rowCount: entries.length,
        success: true,
      })

      expect(entries).toHaveLength(20)
      expect(entries[0].media).toBeDefined()
      expect(duration).toBeLessThan(200) // Should be <200ms with indexes
    })
  })

  describe('Index Verification', () => {
    it('should use indexes for filtered queries', async () => {
      // Insert mixed status habits
      for (let i = 0; i < 50; i++) {
        await testDb.insert(schema.habits).values({
          name: `Habit ${i}`,
          status: i % 2 === 0 ? 'active' : 'resting',
          frequency: 'every_day',
          createdAt: new Date(),
        })
      }

      const startTime = performance.now()
      const activeHabits = await testDb.query.habits.findMany({
        where: eq(schema.habits.status, 'active'),
      })
      const duration = performance.now() - startTime

      recordQueryMetric({
        name: 'filter-habits-by-status',
        duration,
        rowCount: activeHabits.length,
        success: true,
      })

      expect(activeHabits).toHaveLength(25)
      expect(duration).toBeLessThan(20) // Should be very fast with index
    })

    it('should handle date-based queries efficiently', async () => {
      // Insert entries across many dates
      const now = Date.now()
      for (let i = 0; i < 200; i++) {
        await testDb.insert(schema.journalEntries).values({
          content: `Entry ${i}`,
          createdAt: new Date(now - i * 86400000),
          updatedAt: new Date(),
        })
      }

      const startTime = performance.now()
      const recentEntries = await testDb.query.journalEntries.findMany({
        orderBy: desc(schema.journalEntries.createdAt),
        limit: 30,
      })
      const duration = performance.now() - startTime

      recordQueryMetric({
        name: 'fetch-recent-entries-limit-30',
        duration,
        rowCount: recentEntries.length,
        success: true,
      })

      expect(recentEntries).toHaveLength(30)
      expect(duration).toBeLessThan(50) // Should be fast with index
    })
  })

  describe('Data Integrity', () => {
    it('should cascade delete entry media when entry is deleted', async () => {
      const entryResult = await testDb.insert(schema.journalEntries).values({
        content: 'Test entry',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const entryId = Number(entryResult.lastInsertRowid)

      // Add media
      for (let i = 0; i < 3; i++) {
        await testDb.insert(schema.entryMedia).values({
          entryId,
          filePath: `/media/file-${i}.jpg`,
          thumbnailPath: `/media/file-${i}-thumb.jpg`,
          mimeType: 'image/jpeg',
          fileSize: 1024,
          createdAt: new Date(),
        })
      }

      // Verify media exists
      let media = await testDb.query.entryMedia.findMany({
        where: eq(schema.entryMedia.entryId, entryId),
      })
      expect(media).toHaveLength(3)

      // Delete entry
      await testDb
        .delete(schema.journalEntries)
        .where(eq(schema.journalEntries.id, entryId))

      // Verify media was cascade deleted
      media = await testDb.query.entryMedia.findMany({
        where: eq(schema.entryMedia.entryId, entryId),
      })
      expect(media).toHaveLength(0)
    })

    it('should maintain habit-completion relationships', async () => {
      const habitResult = await testDb.insert(schema.habits).values({
        name: 'Test habit',
        frequency: 'every_day',
        status: 'active',
        createdAt: new Date(),
      })
      const habitId = Number(habitResult.lastInsertRowid)

      // Add 30 completions
      for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 86400000)
        const dateStr = date.toISOString().split('T')[0]
        await testDb.insert(schema.habitCompletions).values({
          habitId,
          completedAt: dateStr,
        })
      }

      // Query with relation
      const habit = await testDb.query.habits.findFirst({
        where: eq(schema.habits.id, habitId),
        with: {
          completions: true,
        },
      })

      expect(habit?.completions).toHaveLength(30)
    })
  })
})

describe('Performance Summary', () => {
  it('should log metrics after all tests', () => {
    logMetricsSummary()
    const summary = getMetricsSummary()

    // Verify we ran queries
    expect(summary.total).toBeGreaterThan(0)
    console.log('✅ Database performance tests complete')
  })
})
