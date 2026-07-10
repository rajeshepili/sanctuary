import { describe, expect, it } from 'vitest'
import { isScheduledOn } from '#/utils/consistency'

// ─── isScheduledOn ───────────────────────────────────────────────────────────

describe('isScheduledOn', () => {
  describe('daily', () => {
    it('interval=1: schedules every day from creation', () => {
      expect(isScheduledOn('2026-06-10', 'daily', 1, null, '2026-06-01')).toBe(
        true,
      )
      expect(isScheduledOn('2026-06-11', 'daily', 1, null, '2026-06-01')).toBe(
        true,
      )
    })

    it('interval=2: schedules every other day anchored to createdAt', () => {
      // Created Jun 1. Scheduled: 1, 3, 5, 7 …
      expect(isScheduledOn('2026-06-01', 'daily', 2, null, '2026-06-01')).toBe(
        true,
      ) // 0 days
      expect(isScheduledOn('2026-06-02', 'daily', 2, null, '2026-06-01')).toBe(
        false,
      ) // 1 day
      expect(isScheduledOn('2026-06-03', 'daily', 2, null, '2026-06-01')).toBe(
        true,
      ) // 2 days
      expect(isScheduledOn('2026-06-04', 'daily', 2, null, '2026-06-01')).toBe(
        false,
      ) // 3 days
    })

    it('interval=7: every 7 days from creation (not calendar week)', () => {
      // Created Thu Jun 12. Scheduled: 12, 19, 26 …
      expect(isScheduledOn('2026-06-12', 'daily', 7, null, '2026-06-12')).toBe(
        true,
      )
      expect(isScheduledOn('2026-06-13', 'daily', 7, null, '2026-06-12')).toBe(
        false,
      )
      expect(isScheduledOn('2026-06-19', 'daily', 7, null, '2026-06-12')).toBe(
        true,
      )
    })

    it('rejects dates before createdAt', () => {
      expect(isScheduledOn('2026-05-31', 'daily', 1, null, '2026-06-01')).toBe(
        false,
      )
    })
  })

  describe('weekly', () => {
    it('interval=1, no daysOfWeek: every day of every qualifying week', () => {
      expect(isScheduledOn('2026-06-10', 'weekly', 1, null, '2026-06-01')).toBe(
        true,
      )
      expect(isScheduledOn('2026-06-15', 'weekly', 1, null, '2026-06-01')).toBe(
        true,
      )
    })

    it('interval=1, daysOfWeek=[1,3,5]: only Mon/Wed/Fri', () => {
      expect(
        isScheduledOn('2026-06-15', 'weekly', 1, [1, 3, 5], '2026-06-01'),
      ).toBe(true) // Mon
      expect(
        isScheduledOn('2026-06-16', 'weekly', 1, [1, 3, 5], '2026-06-01'),
      ).toBe(false) // Tue
      expect(
        isScheduledOn('2026-06-17', 'weekly', 1, [1, 3, 5], '2026-06-01'),
      ).toBe(true) // Wed
      expect(
        isScheduledOn('2026-06-19', 'weekly', 1, [1, 3, 5], '2026-06-01'),
      ).toBe(true) // Fri
      expect(
        isScheduledOn('2026-06-20', 'weekly', 1, [1, 3, 5], '2026-06-01'),
      ).toBe(false) // Sat
    })

    it('interval=2: only qualifies every other calendar week', () => {
      // daysOfWeek honoured only in qualifying weeks
      expect(
        isScheduledOn('2026-01-14', 'weekly', 1, [1, 3, 5], '2026-01-01'),
      ).toBe(true) // Wed (qualifies)
      expect(
        isScheduledOn('2026-01-13', 'weekly', 1, [1, 3, 5], '2026-01-01'),
      ).toBe(false) // Tue (wrong day)
    })
  })

  describe('monthly', () => {
    it('interval=1, no daysOfWeek: every day of every month', () => {
      expect(
        isScheduledOn('2026-07-15', 'monthly', 1, null, '2026-06-01'),
      ).toBe(true)
    })

    it('interval=1, daysOfWeek=[1,5]: Mon and Fri of every month', () => {
      expect(isScheduledOn('2026-07-06', 'monthly', 1, [1], '2026-06-01')).toBe(
        true,
      ) // Mon
      expect(isScheduledOn('2026-07-07', 'monthly', 1, [1], '2026-06-01')).toBe(
        false,
      ) // Tue
    })

    it('interval=3: only qualifies every 3rd month', () => {
      // Created Jun 2026. Qualifies: Jun, Sep, Dec …
      expect(
        isScheduledOn('2026-09-15', 'monthly', 3, null, '2026-06-01'),
      ).toBe(true) // 3 months later
      expect(
        isScheduledOn('2026-08-15', 'monthly', 3, null, '2026-06-01'),
      ).toBe(false) // 2 months later
    })
  })

  describe('custom', () => {
    it('always returns true regardless of daysOfWeek or date', () => {
      expect(isScheduledOn('2026-06-10', 'custom', 1, null, '2026-06-01')).toBe(
        true,
      )
      expect(
        isScheduledOn('2026-06-10', 'custom', 1, [1, 3], '2026-06-01'),
      ).toBe(true)
    })

    it('rejects dates before createdAt', () => {
      expect(isScheduledOn('2026-05-31', 'custom', 1, null, '2026-06-01')).toBe(
        false,
      )
    })
  })
})
