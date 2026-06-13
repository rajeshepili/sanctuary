import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeHabitStreak, isScheduledOn } from '#/utils/consistency'

describe('computeHabitStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns zero streaks when there are no completions', () => {
    expect(computeHabitStreak([], 'every_day', null)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      completedToday: false,
    })
  })

  it('counts consecutive every-day completions through today', () => {
    const result = computeHabitStreak(
      [
        '2026-01-10',
        '2026-01-11',
        '2026-01-12',
        '2026-01-13',
        '2026-01-14',
        '2026-01-15',
      ],
      'every_day',
      null,
    )

    expect(result).toEqual({
      currentStreak: 6,
      longestStreak: 6,
      completedToday: true,
    })
  })

  it('resets current streak after a missed scheduled day', () => {
    const result = computeHabitStreak(
      ['2026-01-10', '2026-01-11', '2026-01-13', '2026-01-14', '2026-01-15'],
      'every_day',
      null,
    )

    expect(result).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      completedToday: true,
    })
  })

  it('does not break the streak for an incomplete today', () => {
    const result = computeHabitStreak(
      ['2026-01-13', '2026-01-14'],
      'every_day',
      null,
    )

    expect(result).toEqual({
      currentStreak: 2,
      longestStreak: 2,
      completedToday: false,
    })
  })

  it('tracks weekday-only habits across weekends', () => {
    const result = computeHabitStreak(
      ['2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15'],
      'weekdays',
      null,
    )

    expect(result).toEqual({
      currentStreak: 4,
      longestStreak: 4,
      completedToday: true,
    })
  })

  it('honors custom day schedules', () => {
    expect(
      isScheduledOn('2026-01-13', 'custom', 'monday,wednesday,friday'),
    ).toBe(false)
    expect(
      isScheduledOn('2026-01-14', 'custom', 'monday,wednesday,friday'),
    ).toBe(true)
  })
})
