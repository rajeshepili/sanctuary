import { format, parseISO } from 'date-fns'
import { CONSISTENCY_WINDOW_DAYS } from '#/config/constants'

export type LocalDateString = string & { readonly __brand: unique symbol }

export function toLocalDateString(
  date: Date | string | number,
): LocalDateString {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return format(d, 'yyyy-MM-dd') as LocalDateString
}

export function fromLocalDateString(dateStr: string): Date {
  return parseISO(dateStr)
}

export function getTodayStr(): LocalDateString {
  return toLocalDateString(new Date())
}

/**
 * Returns an array of local date strings for the last N days, oldest-first.
 * Uses CONSISTENCY_WINDOW_DAYS as the default, which is the canonical window
 * for all consistency and identity calculations across Sanctuary.
 */
export function getDailyActivityWindow(
  days: number = CONSISTENCY_WINDOW_DAYS,
): ReturnType<typeof toLocalDateString>[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return toLocalDateString(d)
  }).reverse()
}

/** @deprecated Use getDailyActivityWindow instead */
export const getLast30DaysList = getDailyActivityWindow

export function formatEntryDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, h:mm a')
}
