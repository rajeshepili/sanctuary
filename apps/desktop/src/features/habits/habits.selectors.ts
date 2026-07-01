import type { Habit, HabitCompletion } from '#/types'
import { isScheduledOnDate } from '#/utils/consistency'
import { toLocalDateString } from '#/utils/date'
import { CONSISTENCY_WINDOW_DAYS } from '#/config/constants'

export function buildCompletionMap(completions: HabitCompletion[]) {
  const map = new Map<number, Map<string, string>>()

  for (const completion of completions) {
    if (!map.has(completion.habitId)) {
      map.set(completion.habitId, new Map())
    }

    map.get(completion.habitId)!.set(completion.completedAt, completion.tier)
  }

  return map
}

/**
 * Calculates the consistency percentage for a habit over the last `days` days.
 *
 * Formula:  Math.min(100, round(completedOnScheduledDays / (scheduledDays - skippedDays) * 100))
 *
 * Key design decisions:
 * - Uses toLocalDateString() (date-fns based) to avoid UTC offset bugs.
 * - Only counts scheduled days in the denominator. Off-days do NOT penalise the user.
 * - 'skipped' tier (forgiveness) removes the day from the scheduled denominator.
 * - If the user completes a habit on an unscheduled day, it contributes to the
 *   numerator as a bonus, which can push the score above 100 — capped at 100.
 * - If no days were scheduled (e.g. new habit or very short window), returns
 *   100 if any bonus completions exist, otherwise 0.
 */
export function calculateConsistency(
  habit: Habit,
  completions: Map<string, string>,
  days: number = CONSISTENCY_WINDOW_DAYS,
) {
  const now = new Date()
  const createdAt = habit.createdAt instanceof Date ? habit.createdAt : new Date(habit.createdAt)
  
  // -- FREQUENCY ENGINE (Quantitative Goals e.g. "3 times a week") --
  if (habit.targetCount) {
    let completedCount = 0
    for (let i = 0; i < days; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      if (d < createdAt) break // Don't count before creation
      const tier = completions.get(toLocalDateString(d))
      if (tier && tier !== 'skipped') completedCount++
    }
    
    // Calculate expected target for the rolling window
    let periodDays = 7
    if (habit.frequency === 'monthly') periodDays = 30
    else if (habit.frequency === 'daily') periodDays = 1 // (daily with targetCount > 1 is unusual but possible)

    const targetTotal = Math.ceil((days / periodDays) * habit.targetCount)
    if (targetTotal === 0) return completedCount > 0 ? 100 : 0
    return Math.min(100, Math.round((completedCount / targetTotal) * 100))
  }

  // -- IDENTITY ENGINE (Scheduled Goals e.g. "Every Day" or "Mon/Wed/Fri") --
  let completedCount = 0
  let scheduledCount = 0

  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = toLocalDateString(d)

    const isScheduled = isScheduledOnDate(
      d,
      habit.frequency,
      habit.interval,
      habit.daysOfWeek,
      createdAt,
    )
    const tier = completions.get(dateStr)

    if (isScheduled) {
      if (tier === 'skipped') {
        // skipped days don't count for or against
      } else {
        scheduledCount++
        if (tier) completedCount++
      }
    } else {
      // Bonus: completed on an unscheduled day — reward but don't penalise.
      if (tier && tier !== 'skipped') completedCount++
    }
  }

  if (scheduledCount === 0) return completedCount > 0 ? 100 : 0
  return Math.min(
    100,
    Math.round((completedCount / scheduledCount) * 100),
  )
}

export function calculateIdentityVotes(completions: Map<string, string>) {
  let totalVotes = 0
  const votes = { mini: 1, plus: 2, elite: 3 }

  completions.forEach((tier) => {
    totalVotes += votes[tier as keyof typeof votes] || 0
  })

  return totalVotes
}

export function calculateMissedYesterday(
  habit: Habit,
  completions: Map<string, string>,
  todayStr: string,
) {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yesterdayStr = toLocalDateString(d)
  const createdAt = habit.createdAt instanceof Date ? habit.createdAt : new Date(habit.createdAt)

  return (
    isScheduledOnDate(
      d,
      habit.frequency,
      habit.interval,
      habit.daysOfWeek,
      createdAt,
    ) &&
    !completions.has(yesterdayStr) &&
    !completions.has(todayStr)
  )
}
