import { createFileRoute } from '@tanstack/react-router'
import { habitsQueryOptions } from '#/features/habits/habits.options'

export const Route = createFileRoute('/__app/habits')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(habitsQueryOptions())
  },
})
