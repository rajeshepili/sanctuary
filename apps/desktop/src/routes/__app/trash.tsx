import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { trashQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { useEntryList } from '#/features/journal/hooks/useEntryList'
import { TrashView } from '#/features/journal/components/TrashView'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

export const Route = createFileRoute('/__app/trash')({
  validateSearch: z.object({
    entryId: z.number().optional(),
  }),
  component: TrashEntriesPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(trashQueryOptions())
  },
})

function TrashEntriesPage() {
  const { data: entries } = useSuspenseQuery(trashQueryOptions())
  const { restoreEntry, permanentDeleteEntry } = useJournalMutations()

  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  
  const activeEntry = entries.find((e) => e.id === search.entryId)

  // Semantic Composition
  const list = useEntryList(entries)

  return (
    <FeatureErrorBoundary title="Trash">
      <TrashView
        entries={entries}
        activeEntry={activeEntry}
        list={list}
        onSelect={(id) => navigate({ search: { entryId: id } })}
        onRestore={(id) => {
          restoreEntry(id)
          navigate({ search: { entryId: undefined } })
        }}
        onDeletePermanently={(id) => {
          if (
            confirm(
              'Are you sure you want to permanently delete this reflection? This cannot be undone.',
            )
          ) {
            permanentDeleteEntry(id)
            navigate({ search: { entryId: undefined } })
          }
        }}
      />
    </FeatureErrorBoundary>
  )
}
