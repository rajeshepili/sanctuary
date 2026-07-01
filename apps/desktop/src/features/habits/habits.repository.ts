import { getDb } from '#/database'
import { habits, habitCompletions } from '#/database/schema'
import { eq, and, gte, lt } from 'drizzle-orm'
import type {
  CreateHabitInput,
  UpdateHabitInput,
  UpdateHabitStatusInput,
  DeleteHabitInput,
} from './habits.schema'
import type { Habit, HabitsData } from '#/types'
import { HabitError } from './habits.errors'
import { getFirstOrThrow, ensureRowsAffected } from '#/database/utils'

// ── Shared field mapper ──────────────────────────────────────────────────────
// Centralises the mapping between validated input and the DB column shape.
// Both create and update use identical fields, so a single mapper removes drift.

function mapHabitFields(data: CreateHabitInput | UpdateHabitInput) {
  return {
    name: data.name.trim(),
    identityLabel: data.identityLabel?.trim() ?? null,
    miniDesc: data.miniDesc?.trim() ?? null,
    plusDesc: data.plusDesc?.trim() ?? null,
    eliteDesc: data.eliteDesc?.trim() ?? null,
    frequency: data.frequency,
    interval: data.interval,
    daysOfWeek: data.daysOfWeek ?? null,
    targetCount: data.targetCount ?? null,
    priority: data.priority,
    categoryId: data.categoryId ?? null,
    intention: data.intention?.trim() ?? null,
  }
}

// ── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches all habits and their completions from the last 90 days.
 * The 90-day window is the consistency calculation horizon.
 */
export async function findAll(): Promise<HabitsData> {
  const db = await getDb()

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().split('T')[0]

  const [allHabits, completions] = await Promise.all([
    db.select().from(habits),
    db.select().from(habitCompletions).where(gte(habitCompletions.completedAt, cutoff)),
  ])

  return { habits: allHabits, completions }
}

// ── Commands ─────────────────────────────────────────────────────────────────

export async function create(data: CreateHabitInput): Promise<Habit> {
  const db = await getDb()
  const results = await db.insert(habits).values(mapHabitFields(data)).returning()
  return getFirstOrThrow(results, new HabitError('HABIT_CREATE_FAILED', 'Failed to create habit'))
}

export async function update(data: UpdateHabitInput): Promise<Habit> {
  const db = await getDb()
  const results = await db
    .update(habits)
    .set(mapHabitFields(data))
    .where(eq(habits.id, data.id))
    .returning()
  return getFirstOrThrow(results, new HabitError('HABIT_UPDATE_FAILED', 'Failed to update habit'))
}

export async function updateStatus(data: UpdateHabitStatusInput): Promise<Habit> {
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

export async function remove(data: DeleteHabitInput): Promise<void> {
  const db = await getDb()
  // Completions are deleted first before the habit itself. Even though the
  // schema has ON DELETE CASCADE, libSQL/WAL sometimes doesn't fire it
  // reliably in embedded mode, so we enforce the order explicitly.
  await db.transaction(async (tx) => {
    await tx.delete(habitCompletions).where(eq(habitCompletions.habitId, data.id))
    const results = await tx
      .delete(habits)
      .where(eq(habits.id, data.id))
      .returning({ id: habits.id })
    ensureRowsAffected(results, new HabitError('HABIT_DELETE_FAILED', 'Failed to delete habit'))
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

/**
 * Re-activates any habits whose rest period has expired.
 * Called by the background sync job on app start.
 */
export async function reactivateHabits(): Promise<void> {
  const db = await getDb()
  await db
    .update(habits)
    .set({ status: 'active', restUntil: null })
    .where(and(eq(habits.status, 'resting'), lt(habits.restUntil, new Date())))
}
