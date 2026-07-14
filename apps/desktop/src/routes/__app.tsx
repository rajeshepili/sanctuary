import { AppShell } from '#/components/layout/AppShell'
import { createFileRoute } from '@tanstack/react-router'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'
import { PageSkeleton } from '#/components/layout/PageSkeleton'
import '#/features/journal/journal.css'

export const Route = createFileRoute('/__app')({
  component: AppShell,
  pendingComponent: PageSkeleton,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(preferencesQueryOptions()),
})
