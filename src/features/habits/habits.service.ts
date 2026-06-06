import { getDb } from '#/database'
import type { Database } from '#/database'
import { habits, habitCompletions } from '#/database/schema'
import { eq, and, gte } from 'drizzle-orm'
import type {
  CreateHabitInput,
  UpdateHabitStatusInput,
  DeleteHabitInput,
  ToggleCompletionInput,
} from './habits.schema'

import { computeHabitStreak } from '#/utils/streak'
import type { Habit } from '#/types'

export async function getAllHabitsService() {
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

  await reactivateHabitsAndSyncStreaks(db, allHabits)

  return { habits: allHabits, completions }
}

export async function createHabitService(data: CreateHabitInput) {
  const db = await getDb()
  const [habit] = await db
    .insert(habits)
    .values({
      name: data.name,
      frequency: data.frequency,
      daysOfWeek: data.daysOfWeek ?? null,
      priority: data.priority,
      category: data.category,
      intention: data.intention ?? null,
    })
    .returning()

  return habit
}

export async function updateHabitStatusService(data: UpdateHabitStatusInput) {
  const db = await getDb()
  const [habit] = await db
    .update(habits)
    .set({
      status: data.status,
      restUntil: data.restUntil ? new Date(data.restUntil) : null,
    })
    .where(eq(habits.id, data.id))
    .returning()

  return habit
}

export async function deleteHabitService(data: DeleteHabitInput) {
  const db = await getDb()
  await db.delete(habits).where(eq(habits.id, data.id))
}

export async function syncHabitStreak(habitId: number): Promise<void> {
  const db = await getDb()
  const [habit] = await db.select().from(habits).where(eq(habits.id, habitId))

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const cutoffStr = oneYearAgo.toISOString().split('T')[0]

  const completions = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        gte(habitCompletions.completedAt, cutoffStr),
      ),
    )

  const completionDates = completions.map((c) => c.completedAt)
  const { currentStreak, longestStreak } = computeHabitStreak(
    completionDates,
    habit.frequency,
    habit.daysOfWeek,
  )

  await db
    .update(habits)
    .set({ currentStreak, longestStreak })
    .where(eq(habits.id, habitId))
}

export async function toggleHabitCompletionService(
  data: ToggleCompletionInput,
) {
  const db = await getDb()
  const { habitId, date } = data
  const existing = await db
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
    await db
      .delete(habitCompletions)
      .where(eq(habitCompletions.id, existing[0].id))
  } else {
    await db.insert(habitCompletions).values({ habitId, completedAt: date })
    completed = true
  }

  await syncHabitStreak(habitId)

  return { habitId, date, completed }
}

export async function reactivateHabitsAndSyncStreaks(
  db: Database,
  habitsList?: Habit[],
) {
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
      if (habitsList) {
        habit.status = 'active'
        habit.restUntil = null
      }
    }
  }
}
