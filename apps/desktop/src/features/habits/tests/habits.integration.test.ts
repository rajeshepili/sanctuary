import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import * as schema from '#/database/schema'
import { getSharedTestDatabase, resetTestDatabase } from '#/test/database'
import { seedHabit, seedHabitCompletion } from '#/test/db-seed'
import { formatDate } from '#/test/fixtures'

describe('Habits Integration Tests', () => {
  let db: LibSQLDatabase<typeof schema>

  beforeEach(async () => {
    db = await getSharedTestDatabase()
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates and retrieves a habit', async () => {
    const created = await seedHabit(db, {
      name: 'Integration Habit',
      frequency: 'daily',
    })

    const retrieved = await db.query.habits.findFirst({
      where: eq(schema.habits.id, created.id),
    })

    expect(retrieved?.name).toBe('Integration Habit')
    expect(retrieved?.frequency).toBe('daily')
    expect(retrieved?.categoryId).toBe(null)
  })

  it('updates habit fields', async () => {
    const habit = await seedHabit(db, { name: 'Read' })

    await db
      .update(schema.habits)
      .set({ name: 'Read 10 pages' })
      .where(eq(schema.habits.id, habit.id))

    const updated = await db.query.habits.findFirst({
      where: eq(schema.habits.id, habit.id),
    })

    expect(updated?.name).toBe('Read 10 pages')
  })

  it('marks a habit as resting', async () => {
    const habit = await seedHabit(db)

    await db
      .update(schema.habits)
      .set({ status: 'resting' })
      .where(eq(schema.habits.id, habit.id))

    const updated = await db.query.habits.findFirst({
      where: eq(schema.habits.id, habit.id),
    })

    expect(updated?.status).toBe('resting')
  })

  it('records habit completions', async () => {
    const habit = await seedHabit(db)
    const today = formatDate()

    await seedHabitCompletion(db, habit.id, { completedAt: today })

    const completions = await db.query.habitCompletions.findMany({
      where: eq(schema.habitCompletions.habitId, habit.id),
    })

    expect(completions).toHaveLength(1)
    expect(completions[0]?.completedAt).toBe(today)
  })

  it('deletes a habit and its completions', async () => {
    const habit = await seedHabit(db)
    await seedHabitCompletion(db, habit.id)

    await db.delete(schema.habits).where(eq(schema.habits.id, habit.id))

    const habits = await db.query.habits.findMany()
    const completions = await db.query.habitCompletions.findMany()

    expect(habits).toHaveLength(0)
    expect(completions).toHaveLength(0)
  })

  it('lists habits by status', async () => {
    await seedHabit(db, { name: 'Active habit', status: 'active' })
    await seedHabit(db, { name: 'Resting habit', status: 'resting' })

    const active = await db.query.habits.findMany({
      where: eq(schema.habits.status, 'active'),
    })

    expect(active).toHaveLength(1)
    expect(active[0]?.name).toBe('Active habit')
  })
})
