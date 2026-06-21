import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { habitsCache } from '../habits.cache'
import { habitsKeys } from '../habits.keys'
import type { Habit } from '#/types'

describe('habitsCache', () => {
  let queryClient: QueryClient

  const mockHabits: Habit[] = [
    {
      id: 1,
      name: 'Test Habit',
      status: 'active',
      frequency: 'daily',
      interval: 1,
      priority: 'medium',
      categoryId: null,
      createdAt: new Date(),

      identityLabel: null,
      miniDesc: null,
      plusDesc: null,
      eliteDesc: null,
      intention: null,
      daysOfWeek: null,
      restUntil: null,
    },
  ]

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.spyOn(queryClient, 'setQueryData')
    vi.spyOn(queryClient, 'getQueryData').mockImplementation((key: any) => {
      if (JSON.stringify(key) === JSON.stringify(habitsKeys.all)) {
        return { habits: mockHabits, completions: [] }
      }
      return undefined
    })
  })

  it('insertHabit() adds a habit to the cache', () => {
    const newHabit: Habit = { ...mockHabits[0], id: 2, name: 'New Habit' }
    habitsCache.insertHabit(queryClient, newHabit)

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      habitsKeys.all,
      expect.any(Function),
    )
  })

  it('removeHabit() filters habit and its completions', () => {
    let capturedUpdater: any
    vi.spyOn(queryClient, 'setQueryData').mockImplementation(
      (key: any, updater: any) => {
        if (JSON.stringify(key) === JSON.stringify(habitsKeys.all)) {
          capturedUpdater = updater
        }
        return undefined
      },
    )

    habitsCache.removeHabit(queryClient, 1)
    const updated = capturedUpdater({
      habits: mockHabits,
      completions: [{ habitId: 1 }],
    })

    expect(updated.habits).toHaveLength(0)
    expect(updated.completions).toHaveLength(0)
  })

  it('patchHabitStatus() updates only the targeted habit', () => {
    let capturedUpdater: any
    vi.spyOn(queryClient, 'setQueryData').mockImplementation(
      (key: any, updater: any) => {
        if (JSON.stringify(key) === JSON.stringify(habitsKeys.all)) {
          capturedUpdater = updater
        }
        return undefined
      },
    )

    habitsCache.patchHabitStatus(queryClient, 1, 'resting')
    const updated = capturedUpdater({ habits: mockHabits, completions: [] })

    expect(updated.habits[0].status).toBe('resting')
  })

  it('toggleCompletion() adds a new completion if none exists', () => {
    let capturedUpdater: any
    vi.spyOn(queryClient, 'setQueryData').mockImplementation(
      (key: any, updater: any) => {
        if (JSON.stringify(key) === JSON.stringify(habitsKeys.all)) {
          capturedUpdater = updater
        }
        return undefined
      },
    )

    habitsCache.toggleCompletion(queryClient, 1, '2024-01-01', 'plus')
    const updated = capturedUpdater({ habits: mockHabits, completions: [] })

    expect(updated.completions).toHaveLength(1)
    expect(updated.completions[0].habitId).toBe(1)
    expect(updated.completions[0].tier).toBe('plus')
  })
})
