import { getDb } from '#/database'
import type { Database } from '#/database'
import { habits, habitCompletions } from '#/database/schema'
import { eq, and, gte } from 'drizzle-orm'
import type {
  CreateHabitInput,
  UpdateHabitInput,
  UpdateHabitStatusInput,
  DeleteHabitInput,
  ToggleCompletionInput,
} from './habits.schema'

import type { Habit, HabitsData } from '#/types'
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
      name: data.name,
      identityLabel: data.identityLabel ?? null,
      miniDesc: data.miniDesc ?? null,
      plusDesc: data.plusDesc ?? null,
      eliteDesc: data.eliteDesc ?? null,
      frequency: data.frequency,
      daysOfWeek: data.daysOfWeek ?? null,
      priority: data.priority,
      category: data.category,
      intention: data.intention ?? null,
    })
    .returning()

  return getFirstOrThrow(results, new HabitError('HABIT_CREATE_FAILED', 'Failed to create habit'))
}

export async function updateHabitService(data: UpdateHabitInput): Promise<Habit> {
  const db = await getDb()
  const results = await db
    .update(habits)
    .set({
      name: data.name,
      identityLabel: data.identityLabel ?? null,
      miniDesc: data.miniDesc ?? null,
      plusDesc: data.plusDesc ?? null,
      eliteDesc: data.eliteDesc ?? null,
      frequency: data.frequency,
      daysOfWeek: data.daysOfWeek ?? null,
      priority: data.priority,
      category: data.category,
      intention: data.intention ?? null,
    })
    .where(eq(habits.id, data.id))
    .returning()

  return getFirstOrThrow(results, new HabitError('HABIT_UPDATE_FAILED', 'Failed to update habit'))
}

export async function toggleHabitCompletionService(
  data: ToggleCompletionInput,
): Promise<{ habitId: number; date: string; completed: boolean; tier?: string }> {
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
      await tx.insert(habitCompletions).values({ habitId, completedAt: date, tier })
      completed = true
    }

    return { habitId, date, completed, tier }
  })
}

export async function reactivateHabits(
  db: Database,
  habitsList?: Habit[],
): Promise<void> {
  const allHabits = habitsList || (await db.select().from(habits))
  const now = new Date()

  for (const habit of allHabits) {
    if (
      habit.status === 'resting' &&
      habit.restUntil &&
      new Date(habit.restUntil) < now
    ) {
      await db
        .update(habits)
        .set({ status: 'active', restUntil: null })
        .where(eq(habits.id, habit.id))
    }
  }
}

export async function updateHabitStatusService(data: UpdateHabitStatusInput): Promise<Habit> {
  const db = await getDb()
  const results = await db
    .update(habits)
    .set({
      status: data.status,
      restUntil: data.restUntil ? new Date(data.restUntil) : null,
    })
    .where(eq(habits.id, data.id))
    .returning()

  return getFirstOrThrow(results, new HabitError('HABIT_UPDATE_FAILED', 'Failed to update habit status'))
}

export async function deleteHabitService(data: DeleteHabitInput): Promise<void> {
  const db = await getDb()
  const results = await db.delete(habits).where(eq(habits.id, data.id)).returning()

  ensureRowsAffected(results, new HabitError('HABIT_DELETE_FAILED', 'Failed to delete habit'))
}
