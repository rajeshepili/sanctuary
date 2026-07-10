import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState, useCallback } from 'react'

import { trashQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { useEntryList } from '#/features/journal/hooks/useEntryList'
import { TrashView } from '#/features/journal/components/TrashView'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { PageSkeleton } from '#/components/layout/PageSkeleton'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

export const Route = createLazyFileRoute('/__app/trash')({
  component: TrashPage,
  pendingComponent: PageSkeleton,
})

function TrashPage() {
  const { data: entries } = useSuspenseQuery(trashQueryOptions())
  const { restoreEntry, permanentDeleteEntry } = useJournalMutations()

  const [activeId, setActiveId] = useState<number | null>(null)
  const [purgeId, setPurgeId] = useState<number | null>(null)

  const list = useEntryList(entries)

  const activeEntry = entries.find((e) => e.id === activeId)

  const handleSelect = useCallback((id: number) => setActiveId(id), [])

  const handleRestore = useCallback(
    (id: number) => {
      restoreEntry.mutate(id)
      if (activeId === id) setActiveId(null)
    },
    [restoreEntry, activeId],
  )

  const handlePurgeRequest = useCallback((id: number) => setPurgeId(id), [])

  const handlePurgeConfirm = useCallback(() => {
    if (!purgeId) return
    permanentDeleteEntry.mutate(purgeId)
    if (activeId === purgeId) setActiveId(null)
    setPurgeId(null)
  }, [purgeId, permanentDeleteEntry, activeId])

  return (
    <>
      <FeatureErrorBoundary title="Trash">
        <TrashView
          entries={entries}
          activeEntry={activeEntry}
          list={list}
          onSelect={handleSelect}
          onRestore={handleRestore}
          onDeletePermanently={handlePurgeRequest}
        />
      </FeatureErrorBoundary>

      {/* Permanent delete confirmation */}
      <AlertDialog
        open={purgeId !== null}
        onOpenChange={(open) => !open && setPurgeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This reflection will be erased forever — all content and attached
              photos will be removed from your device. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handlePurgeConfirm}
            >
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
