import { AppShell } from '#/components/layout/AppShell'
import { createFileRoute } from '@tanstack/react-router'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'

export const Route = createFileRoute('/__app')({
  component: AppShell,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(preferencesQueryOptions()),
})
