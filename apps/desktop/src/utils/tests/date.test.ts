import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  toLocalDateString,
  fromLocalDateString,
  getTodayStr,
  getDailyActivityWindow,
  getLast30DaysList,
  formatEntryDate,
} from '#/utils/date'

describe('Date Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-19T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('toLocalDateString', () => {
    it('formats Date objects correctly', () => {
      const date = new Date('2026-06-19T12:00:00Z')
      expect(toLocalDateString(date)).toBe('2026-06-19')
    })

    it('formats ISO strings correctly', () => {
      expect(toLocalDateString('2026-06-19T12:00:00Z')).toBe('2026-06-19')
    })

    it('formats timestamps correctly', () => {
      const timestamp = new Date('2026-06-19T12:00:00Z').getTime()
      expect(toLocalDateString(timestamp)).toBe('2026-06-19')
    })
  })

  describe('fromLocalDateString', () => {
    it('parses local date string back to Date', () => {
      const date = fromLocalDateString('2026-06-19')
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(5) // 0-indexed
      expect(date.getDate()).toBe(19)
    })
  })

  describe('getTodayStr', () => {
    it('returns the formatted local date string for today', () => {
      expect(getTodayStr()).toBe('2026-06-19')
    })
  })

  describe('getDailyActivityWindow', () => {
    it('returns list of local dates oldest-first for the given number of days', () => {
      const window = getDailyActivityWindow(3)
      expect(window).toEqual(['2026-06-17', '2026-06-18', '2026-06-19'])
    })

    it('uses the default window days when no argument is provided', () => {
      const window = getDailyActivityWindow()
      expect(window.length).toBeGreaterThan(0)
      expect(window[window.length - 1]).toBe('2026-06-19')
    })

    it('maintains backwards compatibility via getLast30DaysList alias', () => {
      expect(getLast30DaysList(3)).toEqual(getDailyActivityWindow(3))
    })
  })

  describe('formatEntryDate', () => {
    it('formats the date into the expected presentation format', () => {
      // 2026-06-19T12:00:00Z formatted locally depends on timezone,
      // but assuming standard format: 'MMM d, h:mm a'
      // We will use a predictable Date string without a timezone specifier
      const str = formatEntryDate('2026-06-19T12:00:00')
      expect(str).toBe('Jun 19, 12:00 PM')
    })

    it('formats a numerical timestamp correctly', () => {
      const d = new Date('2026-06-19T12:00:00')
      const str = formatEntryDate(d.getTime())
      expect(str).toBe('Jun 19, 12:00 PM')
    })
  })
})
