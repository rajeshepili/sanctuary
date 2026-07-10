import { createFileRoute } from '@tanstack/react-router'
import { identitiesQueryOptions } from '#/features/habits/habits.options'

export const Route = createFileRoute('/__app/habits')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(identitiesQueryOptions())
  },
})
