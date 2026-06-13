import type { Habit } from '#/types'
import { parseCommaList } from './string'

/**
 * Human-readable label for a habit's schedule frequency.
 * Eliminates the repeated if-chain across HabitsList and HabitsSidebar.
 */
export function formatScheduleLabel(
  habit: Pick<Habit, 'frequency' | 'daysOfWeek'>,
): string {
  if (habit.frequency === 'weekdays') return 'Weekdays Only'
  if (habit.frequency === 'weekends') return 'Weekends Only'
  if (habit.frequency === 'custom' && habit.daysOfWeek) {
    return parseCommaList(habit.daysOfWeek)
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1, 3))
      .join(', ')
  }
  return 'Every Single Day'
}
