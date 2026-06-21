import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeHabitStreak, isScheduledOn } from '#/utils/consistency'

describe('computeHabitStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty streak for no completions', () => {
    expect(computeHabitStreak([], 'daily', 1, null, '2026-06-15')).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      completedToday: false,
    })
  })

  it('computes streak for weekly frequency', () => {
    vi.setSystemTime(new Date('2026-06-20T12:00:00')) // Saturday
    const completions = ['2026-06-10', '2026-06-17'] // Two consecutive Wednesdays
    expect(
      computeHabitStreak(completions, 'weekly', 1, [3], '2026-06-01'),
    ).toEqual({
      currentStreak: 2,
      longestStreak: 2,
      completedToday: false, // 20th is Saturday, scheduled but not completed today? wait, Wed is scheduled, Sat is not. Streak is intact until end of week?
      // Actually, if we use strict dates, cursor checks every day.
      // With our logic, it only breaks if a scheduled day is missed.
      // Wed 17th completed. Sat 20th is not scheduled, so streak is not broken!
    })
  })

  it('breaks streak on missed day', () => {
    vi.setSystemTime(new Date('2026-06-20T12:00:00'))
    const completions = [
      '2026-06-17',
      '2026-06-18',
      // Missed 19th
      '2026-06-20',
    ]
    expect(computeHabitStreak(completions, 'daily', 1, null, '2026-06-15')).toEqual({
      currentStreak: 1, // Only today
      longestStreak: 2, // 17th, 18th
      completedToday: true,
    })
  })

  it('does not penalize if today is missed but yesterday was done', () => {
    vi.setSystemTime(new Date('2026-06-20T12:00:00'))
    const completions = ['2026-06-18', '2026-06-19']
    expect(computeHabitStreak(completions, 'daily', 1, null, '2026-06-15')).toEqual({
      currentStreak: 2, // 18th, 19th (still active until end of today)
      longestStreak: 2,
      completedToday: false,
    })
  })

  it('tracks habits across intervals', () => {
    vi.setSystemTime(new Date('2026-06-20T12:00:00')) // Saturday
    // Created on 16th (Tue). Interval 2. Scheduled: 16th, 18th, 20th
    const completions = ['2026-06-16', '2026-06-18', '2026-06-20']
    
    expect(
      computeHabitStreak(completions, 'daily', 2, null, '2026-06-16'),
    ).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      completedToday: true,
    })
  })

  it('honors custom day schedules for weekly', () => {
    expect(
      isScheduledOn('2026-01-13', 'weekly', 1, [1, 3, 5], '2026-01-01'), // 13th is Tue (2)
    ).toBe(false)
    expect(
      isScheduledOn('2026-01-14', 'weekly', 1, [1, 3, 5], '2026-01-01'), // 14th is Wed (3)
    ).toBe(true)
  })
})
