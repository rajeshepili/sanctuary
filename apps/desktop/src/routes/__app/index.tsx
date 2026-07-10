import { createFileRoute } from '@tanstack/react-router'
import { entriesQueryOptions } from '#/features/journal/journal.options'

export const Route = createFileRoute('/__app/')({
  loader: async ({ context: { queryClient } }) => {
    // Only block on entries (critical for consistency/recent view)
    await queryClient.ensureQueryData(entriesQueryOptions())
  },
})
