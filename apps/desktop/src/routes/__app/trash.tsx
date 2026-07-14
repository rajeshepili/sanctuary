import { createFileRoute } from '@tanstack/react-router'
import { entriesQueryOptions } from '#/features/journal/journal.options'

export const Route = createFileRoute('/__app/trash')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(entriesQueryOptions())
  },
})
