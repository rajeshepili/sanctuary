import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseError } from '#/lib/error-parser'
import { toast } from 'sonner'

import type { HabitStatus, HabitTier } from '#/types'
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

/**
 * Shared helper to snapshot → cancel → restore on optimistic mutations.
 * Returns the previous snapshot for rollback.
 */
async function prepareOptimisticUpdate(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.cancelQueries({ queryKey: habitsKeys.all })
  return habitsCache.snapshot(queryClient)
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: habitsKeys.all })
}

export function useHabitsMutations() {
  const queryClient = useQueryClient()

  const createHabit = useMutation({
    mutationFn: (data: CreateHabitInput) => createHabitApi({ data }),
    onSuccess: (habit) => {
      habitsCache.insertHabit(queryClient, habit)
      toast.success('Identity created.')
    },
    onError: (err) => {
      toast.error(`Could not create identity — ${parseError(err).message}`)
    },
  })

  const updateHabit = useMutation({
    mutationFn: (data: UpdateHabitInput) => updateHabitApi({ data }),
    onMutate: async (data) => {
      const previous = await prepareOptimisticUpdate(queryClient)
      const cached = habitsCache.snapshot(queryClient)
      const current = cached?.habits.find((h) => h.id === data.id)
      if (current) {
        habitsCache.patchHabit(queryClient, { ...current, ...data })
      }
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) habitsCache.restore(queryClient, context.previous)
      toast.error(`Could not update identity — ${parseError(err).message}`)
    },
    onSuccess: () => toast.success('Identity updated.'),
    onSettled: () => invalidate(queryClient),
  })

  const updateHabitStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: HabitStatus }) => {
      const restUntil = status === 'resting'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
        : null
      return updateHabitStatusApi({ data: { id, status, restUntil } })
    },
    onMutate: async ({ id, status }) => {
      const previous = await prepareOptimisticUpdate(queryClient)
      const cached = habitsCache.snapshot(queryClient)
      const current = cached?.habits.find((h) => h.id === id)
      if (current) {
        habitsCache.patchHabit(queryClient, { ...current, status })
      }
      return { previous, status }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) habitsCache.restore(queryClient, context.previous)
      toast.error(`Could not update identity status — ${parseError(err).message}`)
    },
    onSuccess: (_data, _vars, context) => {
      toast.success(context.status === 'resting' ? 'Identity is resting.' : 'Identity is active.')
    },
    onSettled: () => invalidate(queryClient),
  })

  const deleteHabit = useMutation({
    mutationFn: (id: number) => deleteHabitApi({ data: { id } }),
    onMutate: async (id) => {
      const previous = await prepareOptimisticUpdate(queryClient)
      habitsCache.removeHabit(queryClient, id)
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) habitsCache.restore(queryClient, context.previous)
      toast.error(`Could not delete identity — ${parseError(err).message}`)
    },
    onSuccess: () => toast.success('Identity deleted.'),
    onSettled: () => invalidate(queryClient),
  })

  const toggleCompletion = useMutation({
    mutationFn: ({ habitId, date, tier }: { habitId: number; date: string; tier?: HabitTier }) =>
      toggleHabitCompletionApi({ data: { habitId, date, tier } }),
    onMutate: async ({ habitId, date, tier }) => {
      const previous = await prepareOptimisticUpdate(queryClient)
      habitsCache.toggleCompletion(queryClient, habitId, date, tier)
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) habitsCache.restore(queryClient, context.previous)
      toast.error(`Could not save completion — ${parseError(err).message}`)
    },
    onSettled: () => invalidate(queryClient),
  })

  return { createHabit, updateHabit, updateHabitStatus, deleteHabit, toggleCompletion }
}
