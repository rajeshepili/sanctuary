import type { QueryClient } from '@tanstack/react-query'
import type { Habit, HabitTier, HabitsData } from '#/types'
import { habitsKeys } from './habits.keys'

/**
 * All optimistic cache operations live here.
 * Each method mutates the single `habitsKeys.all` cache entry.
 * snapshot/restore are used by mutations for rollback on error.
 */
export const habitsCache = {
  snapshot(queryClient: QueryClient): HabitsData | undefined {
    return queryClient.getQueryData<HabitsData>(habitsKeys.all)
  },

  restore(queryClient: QueryClient, snapshot: HabitsData | undefined) {
    queryClient.setQueryData(habitsKeys.all, snapshot)
  },

  /** Add a new habit to the cached list */
  insertHabit(queryClient: QueryClient, habit: Habit) {
    queryClient.setQueryData<HabitsData>(habitsKeys.all, (old) => {
      if (!old) return { habits: [habit], completions: [] }
      return { ...old, habits: [...old.habits, habit] }
    })
  },

  /** Replace a habit's full record in the cache */
  patchHabit(queryClient: QueryClient, habit: Habit) {
    queryClient.setQueryData<HabitsData>(habitsKeys.all, (old) => {
      if (!old) return old
      return {
        ...old,
        habits: old.habits.map((h) => (h.id === habit.id ? habit : h)),
      }
    })
  },

  /** Remove a habit and its completions from the cache */
  removeHabit(queryClient: QueryClient, id: number) {
    queryClient.setQueryData<HabitsData>(habitsKeys.all, (old) => {
      if (!old) return old
      return {
        habits: old.habits.filter((h) => h.id !== id),
        completions: old.completions.filter((c) => c.habitId !== id),
      }
    })
  },

  /** Toggle a completion entry (add, remove, or switch tier) */
  toggleCompletion(
    queryClient: QueryClient,
    habitId: number,
    date: string,
    tier: HabitTier = 'plus',
  ) {
    queryClient.setQueryData<HabitsData>(habitsKeys.all, (old) => {
      if (!old) return old
      const existing = old.completions.find(
        (c) => c.habitId === habitId && c.completedAt === date,
      )
      let completions = [...old.completions]
      if (existing) {
        if (existing.tier !== tier) {
          // Tier switch — update in place
          completions = completions.map((c) =>
            c.id === existing.id ? { ...c, tier } : c,
          )
        } else {
          // Same tier → toggle off
          completions = completions.filter((c) => c.id !== existing.id)
        }
      } else {
        completions.push({
          id: -Date.now(), // Temporary client-side ID until server response
          habitId,
          completedAt: date,
          tier,
        })
      }
      return { ...old, completions }
    })
  },
}
