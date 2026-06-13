import { format, parseISO } from 'date-fns'

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

export function getLast30DaysList() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return toLocalDateString(d)
  }).reverse()
}

export function formatEntryDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, h:mm a')
}
