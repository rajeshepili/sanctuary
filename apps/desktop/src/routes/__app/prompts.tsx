import { createFileRoute } from '@tanstack/react-router'
import { promptsQueryOptions } from '#/features/prompts/prompts.options'

export const Route = createFileRoute('/__app/prompts')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(promptsQueryOptions())
  },
})
