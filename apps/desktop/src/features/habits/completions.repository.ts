import { getDb } from '#/database'
import { habitCompletions } from '#/database/schema'
import { eq, and } from 'drizzle-orm'
import type { ToggleCompletionInput } from './habits.schema'
import type { HabitTier } from '#/types'

/**
 * Toggles a habit completion on or off, or switches the tier if clicked again.
 * Operates in a transaction to ensure atomicity.
 */
export async function toggleCompletion(data: ToggleCompletionInput): Promise<{
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
