import type { Habit } from '#/types'

/**
 * Human-readable label for a habit's schedule frequency.
 * Eliminates the repeated if-chain across HabitsList and HabitsSidebar.
 */
export function formatScheduleLabel(
  habit: Pick<Habit, 'frequency' | 'interval' | 'daysOfWeek'>,
): string {
  if (habit.frequency === 'daily') {
    return habit.interval === 1 ? 'Every Single Day' : `Every ${habit.interval} Days`
  }
  if (habit.frequency === 'weekly') {
    let base = habit.interval === 1 ? 'Once a Week' : `Every ${habit.interval} Weeks`
    if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const daysStr = habit.daysOfWeek.map((d) => days[d]).join(', ')
      return `${base} (${daysStr})`
    }
    return base
  }
  if (habit.frequency === 'monthly') {
    return habit.interval === 1 ? 'Once a Month' : `Every ${habit.interval} Months`
  }
  if (habit.frequency === 'custom' && habit.daysOfWeek && habit.daysOfWeek.length > 0) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return habit.daysOfWeek.map((d) => days[d]).join(', ')
  }
  return 'Flexible'
}
