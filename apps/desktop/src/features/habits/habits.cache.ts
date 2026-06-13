import type { QueryClient } from '@tanstack/react-query'
import type { Habit, HabitCompletion } from '#/types'
import { habitsKeys } from './habits.keys'

type HabitsData = { habits: Habit[]; completions: HabitCompletion[] }

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

  /** Update the status of a habit */
  patchHabitStatus(
    queryClient: QueryClient,
    id: number,
    status: Habit['status'],
  ) {
    queryClient.setQueryData<HabitsData>(habitsKeys.all, (old) => {
      if (!old) return old
      return {
        ...old,
        habits: old.habits.map((h) => (h.id === id ? { ...h, status } : h)),
      }
    })
  },

  /** Toggle a completion entry (add or remove) */
  toggleCompletion(queryClient: QueryClient, habitId: number, date: string, tier?: 'mini' | 'plus' | 'elite') {
    queryClient.setQueryData<HabitsData>(habitsKeys.all, (old) => {
      if (!old) return old
      const existing = old.completions.find(
        (c) => c.habitId === habitId && c.completedAt === date,
      )
      let completions = [...old.completions]
      if (existing) {
        if (tier && existing.tier !== tier) {
           completions = completions.map(c => c.id === existing.id ? { ...c, tier } : c)
        } else {
           completions = completions.filter((c) => !(c.habitId === habitId && c.completedAt === date))
        }
      } else {
         completions.push({ id: -Date.now(), habitId, completedAt: date, tier: tier ?? 'plus' })
      }
      return { ...old, completions }
    })
  },
}
