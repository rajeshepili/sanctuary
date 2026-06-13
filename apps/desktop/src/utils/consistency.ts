import { addDays, getDay } from 'date-fns'
import type { HabitFrequency } from '#/types'
import { parseCommaList } from './string'
import { toLocalDateString, fromLocalDateString, getTodayStr } from './date'

export function isScheduledOnDate(
  date: Date,
  frequency: HabitFrequency,
  daysOfWeek: string | null,
): boolean {
  if (frequency === 'every_day') return true

  const dayOfWeek = getDay(date) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
  if (frequency === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6

  if (!daysOfWeek) return false

  const activeDays = parseCommaList(daysOfWeek)
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return activeDays.includes(dayNames[dayOfWeek])
}

export function isScheduledOn(
  dateStr: string,
  frequency: HabitFrequency,
  daysOfWeek: string | null,
): boolean {
  return isScheduledOnDate(fromLocalDateString(dateStr), frequency, daysOfWeek)
}

interface StreakResult {
  currentStreak: number
  longestStreak: number
  completedToday: boolean
}

export function computeHabitStreak(
  completions: string[],
  frequency: HabitFrequency,
  daysOfWeek: string | null,
): StreakResult {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completedToday: false }
  }

  const completionSet = new Set(completions.map((c) => toLocalDateString(c)))
  const sortedDates = [...completionSet].sort((a, b) => a.localeCompare(b))

  const todayStr = getTodayStr()
  const today = fromLocalDateString(todayStr)
  const firstDate = fromLocalDateString(sortedDates[0])

  let current = 0
  let longest = 0

  let cursor = firstDate
  while (cursor.getTime() <= today.getTime()) {
    const cursorStr = toLocalDateString(cursor)
    const isScheduled = isScheduledOnDate(cursor, frequency, daysOfWeek)
    const isCompleted = completionSet.has(cursorStr)

    if (isCompleted) {
      current++
      if (current > longest) longest = current
    } else if (isScheduled && cursorStr !== todayStr) {
      current = 0
    }

    cursor = addDays(cursor, 1)
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    completedToday: completionSet.has(todayStr),
  }
}
