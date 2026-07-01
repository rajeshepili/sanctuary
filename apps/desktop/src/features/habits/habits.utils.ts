import type { Habit } from '#/types'

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function formatDays(daysOfWeek: number[]): string {
  return daysOfWeek.map((d) => WEEKDAY_NAMES[d]).join(', ')
}

/**
 * Human-readable label for a habit's schedule frequency.
 * Covers all four modes: daily, weekly, monthly, custom.
 */
export function formatScheduleLabel(
  habit: Pick<Habit, 'frequency' | 'interval' | 'daysOfWeek' | 'targetCount'>,
): string {
  const hasDays = habit.daysOfWeek && habit.daysOfWeek.length > 0

  if (habit.frequency === 'daily') {
    return habit.interval === 1 ? 'Every Day' : `Every ${habit.interval} Days`
  }

  if (habit.frequency === 'weekly') {
    if (habit.targetCount) {
      return `${habit.targetCount}x a Week`
    }
    const base = habit.interval === 1 ? 'Weekly' : `Every ${habit.interval} Weeks`
    return hasDays ? `${base} · ${formatDays(habit.daysOfWeek!)}` : base
  }

  if (habit.frequency === 'monthly') {
    if (habit.targetCount) {
      return `${habit.targetCount}x a Month`
    }
    const base = habit.interval === 1 ? 'Monthly' : `Every ${habit.interval} Months`
    // daysOfWeek on monthly means "these weekdays within each qualifying month"
    return hasDays ? `${base} · ${formatDays(habit.daysOfWeek!)}` : base
  }

  return 'Flexible'
}
