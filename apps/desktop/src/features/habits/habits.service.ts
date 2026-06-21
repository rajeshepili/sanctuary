import { getDb } from '#/database'
import type { Database } from '#/database'
import { habits, habitCompletions } from '#/database/schema'
import { eq, and, gte, lt } from 'drizzle-orm'
import type {
  CreateHabitInput,
  UpdateHabitInput,
  UpdateHabitStatusInput,
  DeleteHabitInput,
  ToggleCompletionInput,
} from './habits.schema'

import type { Habit, HabitsData, HabitTier } from '#/types'
import { HabitError } from './habits.errors'
import { getFirstOrThrow, ensureRowsAffected } from '#/database/utils'

export async function getAllHabitsService(): Promise<HabitsData> {
  const db = await getDb()

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoffStr = ninetyDaysAgo.toISOString().split('T')[0]

  const [allHabits, completions] = await Promise.all([
    db.select().from(habits),
    db
      .select()
      .from(habitCompletions)
      .where(gte(habitCompletions.completedAt, cutoffStr)),
  ])

  return { habits: allHabits, completions }
}

export async function createHabitService(data: CreateHabitInput): Promise<Habit> {
  const db = await getDb()
  const results = await db
    .insert(habits)
    .values({
      name: data.name.trim(),
      identityLabel: data.identityLabel?.trim() ?? null,
      miniDesc: data.miniDesc?.trim() ?? null,
      plusDesc: data.plusDesc?.trim() ?? null,
      eliteDesc: data.eliteDesc?.trim() ?? null,
      frequency: data.frequency,
      interval: data.interval,
      daysOfWeek: data.daysOfWeek ?? null,
      priority: data.priority,
      categoryId: data.categoryId ?? null,
      intention: data.intention?.trim() ?? null,
    })
    .returning()

  return getFirstOrThrow(results, new HabitError('HABIT_CREATE_FAILED', 'Failed to create habit'))
}

export async function updateHabitService(data: UpdateHabitInput): Promise<Habit> {
  const db = await getDb()
  const results = await db
    .update(habits)
    .set({
      name: data.name.trim(),
      identityLabel: data.identityLabel?.trim() ?? null,
      miniDesc: data.miniDesc?.trim() ?? null,
      plusDesc: data.plusDesc?.trim() ?? null,
      eliteDesc: data.eliteDesc?.trim() ?? null,
      frequency: data.frequency,
      interval: data.interval,
      daysOfWeek: data.daysOfWeek ?? null,
      priority: data.priority,
      categoryId: data.categoryId ?? null,
      intention: data.intention?.trim() ?? null,
    })
    .where(eq(habits.id, data.id))
    .returning()

  return getFirstOrThrow(
    results,
    new HabitError('HABIT_UPDATE_FAILED', 'Failed to update habit'),
  )
}

export async function toggleHabitCompletionService(
  data: ToggleCompletionInput,
): Promise<{
  habitId: number
  date: string
  completed: boolean
  tier?: HabitTier
}> {
  const db = await getDb()
  const { habitId, date, tier = 'plus' } = data

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.completedAt, date),
        ),
      )

    let completed = false
    if (existing.length > 0) {
      // If clicking the same tier → toggle off. Different tier → update tier.
      if (existing[0].tier === tier) {
        await tx
          .delete(habitCompletions)
          .where(eq(habitCompletions.id, existing[0].id))
        completed = false
      } else {
        await tx
          .update(habitCompletions)
          .set({ tier })
          .where(eq(habitCompletions.id, existing[0].id))
        completed = true
      }
    } else {
      await tx
        .insert(habitCompletions)
        .values({ habitId, completedAt: date, tier })
      completed = true
    }

    return { habitId, date, completed, tier }
  })
}

export async function reactivateHabits(
  db: Database,
  _habitsList?: Habit[],
): Promise<void> {
  const now = new Date()
  await db
    .update(habits)
    .set({ status: 'active', restUntil: null })
    .where(and(eq(habits.status, 'resting'), lt(habits.restUntil, now)))
}

export async function updateHabitStatusService(
  data: UpdateHabitStatusInput,
): Promise<Habit> {
  const db = await getDb()
  const results = await db
    .update(habits)
    .set({
      status: data.status,
      restUntil: data.restUntil ? new Date(data.restUntil) : null,
    })
    .where(eq(habits.id, data.id))
    .returning()

  return getFirstOrThrow(
    results,
    new HabitError('HABIT_UPDATE_FAILED', 'Failed to update habit status'),
  )
}

export async function deleteHabitService(
  data: DeleteHabitInput,
): Promise<void> {
  const db = await getDb()

  await db.transaction(async (tx) => {
    // Delete completions first (cascade is sometimes flaky in local SQLite implementations)
    await tx
      .delete(habitCompletions)
      .where(eq(habitCompletions.habitId, data.id))

    const results = await tx
      .delete(habits)
      .where(eq(habits.id, data.id))
      .returning({ id: habits.id })
    ensureRowsAffected(
      results,
      new HabitError('HABIT_DELETE_FAILED', 'Failed to delete habit'),
    )
  })
}
