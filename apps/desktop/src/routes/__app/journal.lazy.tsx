import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { infiniteEntriesQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { useEntryList } from '#/features/journal/hooks/useEntryList'
import { useEntryEditor } from '#/features/journal/hooks/useEntryEditor'
import { useDraft } from '#/hooks/use-draft'
import { JournalView } from '#/features/journal/components/JournalView'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '#/components/ui/alert-dialog'

export const Route = createLazyFileRoute('/__app/journal')({
  component: JournalEntriesPage,
})

function JournalEntriesPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(infiniteEntriesQueryOptions())

  const entries = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data],
  )

  const { togglePin, deleteEntry } = useJournalMutations()

  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const activeEntry = useMemo(
    () => entries.find(e => e.id === search.entryId),
    [entries, search.entryId]
  )

  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Semantic Composition
  const list = useEntryList(entries)
  const editor = useEntryEditor(activeEntry)

  const {
    status: draftStatus,
    error: draftError,
    clearDraft,
    retrySave: retryDraftSave,
  } = useDraft({
    key: search.isCreating 
      ? 'new_entry' 
      : activeEntry && editor.isEditing 
        ? `edit_${activeEntry.id}` 
        : 'new_entry',
    value: editor.content,
    onRestore: (val) => editor.setContent(val),
  })

  return (
    <>
      <FeatureErrorBoundary title="Journal" resetKeys={[search.entryId, search.isCreating]}>
        <JournalView
          entries={entries}
          activeEntry={activeEntry}
          isCreating={search.isCreating}
          list={list}
          editor={editor}
          onSelect={(id) => navigate({ search: { entryId: id, isCreating: undefined }, resetScroll: false })}
          onCreateNew={() => navigate({ search: { isCreating: true, entryId: undefined }, resetScroll: false })}
          onCancelCreate={() => navigate({ search: { isCreating: undefined }, resetScroll: false })}
          onSaveNew={(id) => {
            clearDraft()
            navigate({ search: { entryId: id, isCreating: undefined }, resetScroll: false })
          }}
          onEditSave={() => {
            clearDraft()
            editor.cancelEdit()
          }}
          onTogglePin={(id) => togglePin.mutate(id)}
          onDelete={setDeleteId}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          draftStatus={draftStatus}
          draftError={draftError}
          retryDraftSave={retryDraftSave}
          copyDraft={() => {
            navigator.clipboard.writeText(editor.content)
          }}
        />
      </FeatureErrorBoundary>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this reflection to trash?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteEntry.mutate(deleteId)
                  if (activeEntry?.id === deleteId) {
                    navigate({ search: { entryId: undefined }, resetScroll: false })
                  }
                  setDeleteId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
