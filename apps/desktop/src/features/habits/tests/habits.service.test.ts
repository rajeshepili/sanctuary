import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import { createIsolatedTestDatabase, resetTestDatabase } from '#/test/database'
import { setDb } from '#/database'
import {
  getAllHabitsService,
  createHabitService,
  updateHabitService,
  toggleHabitCompletionService,
  reactivateHabits,
  updateHabitStatusService,
  deleteHabitService,
} from '../habits.service'

let db: LibSQLDatabase<typeof schema>

describe('Habits Service', () => {
  beforeAll(async () => {
    db = await createIsolatedTestDatabase()
  })

  beforeEach(() => {
    setDb(db)
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates and reads habits correctly', async () => {
    const habit = await createHabitService({
      name: 'Read 10 pages',
      frequency: 'daily',
      interval: 1,
      priority: 'high',
      categoryId: null,
      intention: 'To read more',
    })

    expect(habit.name).toBe('Read 10 pages')

    const data = await getAllHabitsService()
    expect(data.habits).toHaveLength(1)
    expect(data.habits[0].id).toBe(habit.id)
    expect(data.completions).toHaveLength(0)
  })

  it('updates a habit correctly', async () => {
    const habit = await createHabitService({
      name: 'Write',
      frequency: 'daily',
      interval: 1,
      priority: 'low',
      categoryId: null,
    })

    const updated = await updateHabitService({
      id: habit.id,
      name: 'Write 500 words',
      frequency: 'daily',
      interval: 1,
      priority: 'high',
      categoryId: null,
    })

    expect(updated.name).toBe('Write 500 words')
    expect(updated.priority).toBe('high')
  })

  it('throws HABIT_UPDATE_FAILED when updating non-existent habit', async () => {
    await expect(
      updateHabitService({
        id: 999,
        name: 'Ghost',
        frequency: 'daily',
        interval: 1,
        priority: 'medium',
        categoryId: null,
      }),
    ).rejects.toThrow('Failed to update habit')
  })

  describe('toggleHabitCompletionService', () => {
    it('toggles completion on and off', async () => {
      const habit = await createHabitService({
        name: 'Drink water',
        frequency: 'daily',
        interval: 1,
        priority: 'medium',
      })

      // Complete it
      const c1 = await toggleHabitCompletionService({
        habitId: habit.id,
        date: '2026-06-20',
      })
      expect(c1.completed).toBe(true)
      expect(c1.tier).toBe('plus') // default

      const data1 = await getAllHabitsService()
      expect(data1.completions).toHaveLength(1)

      // Toggle off (same tier)
      const c2 = await toggleHabitCompletionService({
        habitId: habit.id,
        date: '2026-06-20',
        tier: 'plus',
      })
      expect(c2.completed).toBe(false)

      const data2 = await getAllHabitsService()
      expect(data2.completions).toHaveLength(0)
    })

    it('changes tier instead of toggling off if different tier provided', async () => {
      const habit = await createHabitService({
        name: 'Drink water',
        frequency: 'daily',
        interval: 1,
        priority: 'medium',
      })

      // Complete as 'mini'
      await toggleHabitCompletionService({
        habitId: habit.id,
        date: '2026-06-20',
        tier: 'mini',
      })

      // Update to 'elite'
      const c2 = await toggleHabitCompletionService({
        habitId: habit.id,
        date: '2026-06-20',
        tier: 'elite',
      })
      expect(c2.completed).toBe(true)
      expect(c2.tier).toBe('elite')

      const data = await getAllHabitsService()
      expect(data.completions).toHaveLength(1)
      expect(data.completions[0].tier).toBe('elite')
    })
  })

  it('updates habit status', async () => {
    const habit = await createHabitService({
      name: 'Run',
      frequency: 'daily',
      interval: 1,
      priority: 'high',
    })

    const updated = await updateHabitStatusService({
      id: habit.id,
      status: 'resting',
      restUntil: new Date('2026-06-30T00:00:00.000Z'),
    })

    expect(updated.status).toBe('resting')
    expect(updated.restUntil).not.toBeNull()
  })

  it('throws HABIT_UPDATE_FAILED when updating status of non-existent habit', async () => {
    await expect(
      updateHabitStatusService({
        id: 999,
        status: 'resting',
      }),
    ).rejects.toThrow('Failed to update habit status')
  })

  it('deletes habit and completions', async () => {
    const habit = await createHabitService({
      name: 'Delete me',
      frequency: 'daily',
      interval: 1,
      priority: 'medium',
    })

    await toggleHabitCompletionService({
      habitId: habit.id,
      date: '2026-06-20',
    })

    await deleteHabitService({ id: habit.id })

    const data = await getAllHabitsService()
    expect(data.habits).toHaveLength(0)
    expect(data.completions).toHaveLength(0)
  })

  it('throws HABIT_DELETE_FAILED when deleting non-existent habit', async () => {
    await expect(deleteHabitService({ id: 999 })).rejects.toThrow(
      'Failed to delete habit',
    )
  })

  it('reactivates habits past their rest period', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-20T12:00:00Z'))

    const habit1 = await createHabitService({
      name: 'Run',
      frequency: 'daily',
      interval: 1,
      priority: 'medium',
    })

    await updateHabitStatusService({
      id: habit1.id,
      status: 'resting',
      restUntil: new Date('2026-06-19T12:00:00Z'), // In the past!
    })

    const habit2 = await createHabitService({
      name: 'Walk',
      frequency: 'daily',
      interval: 1,
      priority: 'medium',
      })

    await updateHabitStatusService({
      id: habit2.id,
      status: 'resting',
      restUntil: new Date('2026-06-21T12:00:00Z'), // In the future!
    })

    await reactivateHabits(db)

    const data = await getAllHabitsService()
    const updated1 = data.habits.find((h) => h.id === habit1.id)!
    const updated2 = data.habits.find((h) => h.id === habit2.id)!

    expect(updated1.status).toBe('active')
    expect(updated1.restUntil).toBeNull()

    expect(updated2.status).toBe('resting')
    expect(updated2.restUntil).not.toBeNull()

    vi.useRealTimers()
  })
})
