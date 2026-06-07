import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from '#/database/schema'
import { eq } from 'drizzle-orm'
import { createIsolatedTestDatabase } from '#/test/database'
import { mockGetDb } from '#/test/mock-db'
import { seedHabit, seedHabitCompletion } from '#/test/db-seed'
import { syncHabitStreak } from './habits.service'

describe('syncHabitStreak', () => {
  let db: LibSQLDatabase<typeof schema>
  let getDbSpy: ReturnType<typeof mockGetDb>

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00'))
    db = await createIsolatedTestDatabase()
    getDbSpy = mockGetDb(db)
  })

  afterEach(() => {
    getDbSpy.mockRestore()
    vi.useRealTimers()
  })

  it('persists streak counts from completion history', async () => {
    const habit = await seedHabit(db, { frequency: 'every_day' })
    for (const date of [
      '2026-01-10',
      '2026-01-11',
      '2026-01-12',
      '2026-01-13',
      '2026-01-14',
      '2026-01-15',
    ]) {
      await seedHabitCompletion(db, habit.id, { completedAt: date })
    }

    await syncHabitStreak(habit.id)

    const updated = await db.query.habits.findFirst({
      where: eq(schema.habits.id, habit.id),
    })

    expect(updated?.currentStreak).toBe(6)
    expect(updated?.longestStreak).toBe(6)
  })

  it('reflects a broken streak after a missed day', async () => {
    const habit = await seedHabit(db, { frequency: 'every_day' })
    for (const date of [
      '2026-01-10',
      '2026-01-11',
      '2026-01-13',
      '2026-01-14',
      '2026-01-15',
    ]) {
      await seedHabitCompletion(db, habit.id, { completedAt: date })
    }

    await syncHabitStreak(habit.id)

    const updated = await db.query.habits.findFirst({
      where: eq(schema.habits.id, habit.id),
    })

    expect(updated?.currentStreak).toBe(3)
    expect(updated?.longestStreak).toBe(3)
  })
})
