import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { infiniteEntriesQueryOptions } from '#/features/journal/journal.options'

export const Route = createFileRoute('/__app/journal')({
  validateSearch: z.object({
    entryId: z.number().optional(),
    isCreating: z.boolean().optional(),
  }),
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureInfiniteQueryData(infiniteEntriesQueryOptions())
  },
})
