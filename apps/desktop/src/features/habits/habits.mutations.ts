import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseError } from '#/lib/error-parser'
import { toast } from 'sonner'

import type { HabitStatus, Habit } from '#/types'
import type { CreateHabitInput, UpdateHabitInput } from './habits.schema'
import { habitsCache } from './habits.cache'
import { habitsKeys } from './habits.keys'
import {
  createHabit as createHabitApi,
  updateHabit as updateHabitApi,
  deleteHabit as deleteHabitApi,
  updateHabitStatus as updateHabitStatusApi,
  toggleHabitCompletion as toggleHabitCompletionApi,
} from './habits.api'

export function useHabitsMutations() {
  const queryClient = useQueryClient()

  const createHabit = useMutation({
    mutationFn: (data: CreateHabitInput) => createHabitApi({ data }),
    onSuccess: (habit) => {
      habitsCache.insertHabit(queryClient, habit)
      toast.success('Habit created.')
    },
    onError: (err) => {
      toast.error(`Could not create habit — ${parseError(err).message}`)
    },
  })

  const updateHabit = useMutation({
    mutationFn: (data: UpdateHabitInput) => updateHabitApi({ data }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: habitsKeys.all })
      const previous = habitsCache.snapshot(queryClient)
      // Optimistic update — merge new data into the cached habit
      const currentHabits = queryClient.getQueryData<{ habits: Habit[] }>(
        habitsKeys.all,
      )
      if (currentHabits) {
        const currentHabit = currentHabits.habits.find(
          (h) => h.id === data.id,
        )
        if (currentHabit) {
          habitsCache.patchHabit(queryClient, {
            ...currentHabit,
            ...data,
          })
        }
      }
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        habitsCache.restore(queryClient, context.previous)
      }
      toast.error(`Could not update habit — ${parseError(err).message}`)
    },
    onSuccess: () => {
      toast.success('Habit updated.')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: habitsKeys.all })
    },
  })

  const updateHabitStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: HabitStatus }) => {
      const restUntilDate = new Date()
      restUntilDate.setDate(restUntilDate.getDate() + 7)
      const restUntil = status === 'resting' ? restUntilDate : null
      return updateHabitStatusApi({ data: { id, status, restUntil } })
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: habitsKeys.all })
      const previous = habitsCache.snapshot(queryClient)
      habitsCache.patchHabitStatus(queryClient, id, status)
      return { previous, status }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        habitsCache.restore(queryClient, context.previous)
      }
      toast.error(`Could not update habit status — ${parseError(err).message}`)
    },
    onSuccess: (_data, _vars, context) => {
      toast.success(
        context?.status === 'resting'
          ? 'Habit is resting.'
          : 'Habit is active.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: habitsKeys.all })
    },
  })

  const deleteHabit = useMutation({
    mutationFn: (id: number) => deleteHabitApi({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: habitsKeys.all })
      const previous = habitsCache.snapshot(queryClient)
      habitsCache.removeHabit(queryClient, id)
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        habitsCache.restore(queryClient, context.previous)
      }
      toast.error(`Could not delete habit — ${parseError(err).message}`)
    },
    onSuccess: () => {
      toast.success('Habit deleted.')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: habitsKeys.all })
    },
  })

  const toggleCompletion = useMutation({
    mutationFn: ({
      habitId,
      date,
      tier,
    }: {
      habitId: number
      date: string
      tier?: 'mini' | 'plus' | 'elite' | 'skipped'
    }) => toggleHabitCompletionApi({ data: { habitId, date, tier } }),
    onMutate: async ({ habitId, date, tier }) => {
      await queryClient.cancelQueries({ queryKey: habitsKeys.all })
      const previous = habitsCache.snapshot(queryClient)
      habitsCache.toggleCompletion(queryClient, habitId, date, tier)
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        habitsCache.restore(queryClient, context.previous)
      }
      toast.error(`Could not save completion — ${parseError(err).message}`)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: habitsKeys.all })
    },
  })

  return {
    createHabit,
    updateHabit,
    updateHabitStatus,
    deleteHabit,
    toggleCompletion,
  }
}
