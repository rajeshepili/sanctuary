import { addDays, differenceInDays, differenceInCalendarWeeks, differenceInCalendarMonths, getDay } from 'date-fns'
import type { HabitFrequency } from '#/types'
import { toLocalDateString, fromLocalDateString, getTodayStr } from './date'

export function isScheduledOnDate(
  date: Date,
  frequency: HabitFrequency,
  interval: number,
  daysOfWeek: number[] | null,
  createdAt: Date,
): boolean {
  // Reset time to start of day for accurate day differences
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const d2 = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate())
  
  // You cannot be scheduled before the habit was created
  if (d1 < d2) return false

  if (frequency === 'daily') {
    const diffDays = Math.abs(differenceInDays(d1, d2))
    return diffDays % interval === 0
  }

  if (frequency === 'weekly') {
    const diffWeeks = Math.abs(differenceInCalendarWeeks(d1, d2, { weekStartsOn: 1 }))
    if (diffWeeks % interval !== 0) return false
    
    // If daysOfWeek is provided, check if today is one of those days
    // getDay: 0=Sun, 1=Mon...
    if (daysOfWeek && daysOfWeek.length > 0) {
      return daysOfWeek.includes(getDay(d1))
    }
    
    // If no specific days, assume it's scheduled every day of the active week 
    // (a "flexible" goal might just mean complete it once, but for strict UI logic, 
    // it's available every day that week).
    return true
  }

  if (frequency === 'monthly') {
    const diffMonths = Math.abs(differenceInCalendarMonths(d1, d2))
    if (diffMonths % interval !== 0) return false
    
    // If daysOfWeek is provided, it might mean "these days of the week, but only in this month".
    if (daysOfWeek && daysOfWeek.length > 0) {
      return daysOfWeek.includes(getDay(d1))
    }
    
    // If no specific days, scheduled every day of the active month
    return true
  }

  // Custom - default to always available if active
  return true
}

export function isScheduledOn(
  dateStr: string,
  frequency: HabitFrequency,
  interval: number,
  daysOfWeek: number[] | null,
  createdAtStr: string,
): boolean {
  return isScheduledOnDate(fromLocalDateString(dateStr), frequency, interval, daysOfWeek, fromLocalDateString(createdAtStr))
}

interface StreakResult {
  currentStreak: number
  longestStreak: number
  completedToday: boolean
}

export function computeHabitStreak(
  completions: string[],
  frequency: HabitFrequency,
  interval: number,
  daysOfWeek: number[] | null,
  createdAtStr: string,
): StreakResult {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completedToday: false }
  }

  const completionSet = new Set(completions.map((c) => toLocalDateString(c)))
  const sortedDates = [...completionSet].sort((a, b) => a.localeCompare(b))

  const todayStr = getTodayStr()
  const today = fromLocalDateString(todayStr)
  const firstDateStr = sortedDates[0]
  
  // Start streak calculation from the earliest of (first completion, createdAt)
  const created = fromLocalDateString(createdAtStr)
  const firstComp = fromLocalDateString(firstDateStr)
  let cursor = firstComp < created ? firstComp : created

  let current = 0
  let longest = 0

  while (cursor.getTime() <= today.getTime()) {
    const cursorStr = toLocalDateString(cursor)
    const isScheduled = isScheduledOnDate(cursor, frequency, interval, daysOfWeek, created)
    const isCompleted = completionSet.has(cursorStr)

    if (isCompleted) {
      current++
      if (current > longest) longest = current
    } else if (isScheduled && cursorStr !== todayStr) {
      // Missed a scheduled day in the past -> break streak
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
