import { startOfDay, differenceInDays, differenceInCalendarWeeks, differenceInCalendarMonths, getDay } from 'date-fns'
import type { HabitFrequency } from '#/types'
import { fromLocalDateString } from './date'

export function isScheduledOnDate(
  date: Date,
  frequency: HabitFrequency,
  interval: number,
  daysOfWeek: number[] | null,
  createdAt: Date,
): boolean {
  // startOfDay normalises to local midnight, which is immune to UTC-vs-local
  // issues (e.g. new Date('2026-06-21T00:00:00Z') in UTC+2 = June 20 locally).
  const d1 = startOfDay(date)
  const d2 = startOfDay(createdAt)

  // Cannot be scheduled before the habit was created
  if (d1 < d2) return false

  if (frequency === 'daily') {
    // Guard ensures d1 >= d2, so differenceInDays is always non-negative
    const diffDays = differenceInDays(d1, d2)
    return diffDays % interval === 0
  }

  if (frequency === 'weekly') {
    const diffWeeks = differenceInCalendarWeeks(d1, d2, { weekStartsOn: 1 })
    if (diffWeeks % interval !== 0) return false
    // If specific weekdays are pinned, filter to those days only
    if (daysOfWeek && daysOfWeek.length > 0) {
      return daysOfWeek.includes(getDay(d1))
    }
    // No specific days: available every day of the qualifying week
    return true
  }

  if (frequency === 'monthly') {
    const diffMonths = differenceInCalendarMonths(d1, d2)
    if (diffMonths % interval !== 0) return false
    // If specific weekdays are pinned, filter to those days within the qualifying month
    if (daysOfWeek && daysOfWeek.length > 0) {
      return daysOfWeek.includes(getDay(d1))
    }
    // No specific days: available every day of the qualifying month
    return true
  }

  // custom — always available if active
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


