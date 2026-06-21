import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useMemo, useState, useEffect, useCallback } from 'react'

import { infiniteEntriesQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { useEntryList } from '#/features/journal/hooks/useEntryList'
import { useEntryEditor } from '#/features/journal/hooks/useEntryEditor'
import { useDraft } from '#/hooks/use-draft'
import { JournalView } from '#/features/journal/components/JournalView'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { useUIStore } from '#/stores/ui-store'

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
    () => entries.find((e) => e.id === search.entryId),
    [entries, search.entryId],
  )

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const list = useEntryList(entries)
  const editor = useEntryEditor(activeEntry)

  const setFocusMode = useUIStore((s) => s.setFocusMode)
  const isEditing = editor.isEditing || !!search.isCreating

  useEffect(() => {
    setFocusMode(isEditing)
    return () => setFocusMode(false)
  }, [isEditing, setFocusMode])

  // Draft: key changes depending on the current mode so drafts don't bleed
  // across create→edit transitions
  const draftKey = search.isCreating
    ? 'new_entry'
    : activeEntry && editor.isEditing
      ? `edit_${activeEntry.id}`
      : 'new_entry'

  const {
    status: draftStatus,
    error: draftError,
    clearDraft,
    retrySave: retryDraftSave,
  } = useDraft({
    key: draftKey,
    value: editor.content,
    onRestore: (val) => editor.setContent(val),
  })

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (id: number) => {
      navigate({
        search: { entryId: id, isCreating: undefined },
        resetScroll: false,
      })
    },
    [navigate],
  )

  const handleCreateNew = useCallback(
    () =>
      navigate({
        search: { isCreating: true, entryId: undefined },
        resetScroll: false,
      }),
    [navigate],
  )

  const handleCancelCreate = useCallback(
    () => navigate({ search: { isCreating: undefined }, resetScroll: false }),
    [navigate],
  )

  const handleSaveNew = useCallback(
    (id: number) => {
      clearDraft()
      navigate({
        search: { entryId: id, isCreating: undefined },
        resetScroll: false,
      })
    },
    [clearDraft, navigate],
  )

  const handleEditSave = useCallback(() => {
    clearDraft()
    editor.cancelEdit()
  }, [clearDraft, editor])

  const handleTogglePin = useCallback(
    (id: number) => togglePin.mutate(id),
    [togglePin],
  )

  const handleDeleteRequest = useCallback((id: number) => setDeleteId(id), [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteId) return

    const isDeletingActive = activeEntry?.id === deleteId
    const wasEditing = editor.isEditing && activeEntry?.id === deleteId

    // Stop editing the entry before it disappears from the list
    if (wasEditing) {
      editor.cancelEdit()
      clearDraft()
    }

    deleteEntry.mutate(deleteId)

    // Navigate away from the deleted entry so the viewer doesn't show a ghost
    if (isDeletingActive) {
      navigate({ search: { entryId: undefined }, resetScroll: false })
    }

    setDeleteId(null)
  }, [deleteId, activeEntry, editor, clearDraft, deleteEntry, navigate])

  return (
    <>
      <FeatureErrorBoundary
        title="Journal"
        resetKeys={[search.entryId, search.isCreating]}
      >
        <JournalView
          entries={entries}
          activeEntry={activeEntry}
          isCreating={search.isCreating}
          list={list}
          editor={editor}
          onSelect={handleSelect}
          onCreateNew={handleCreateNew}
          onCancelCreate={handleCancelCreate}
          onSaveNew={handleSaveNew}
          onEditSave={handleEditSave}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteRequest}
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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This reflection will be moved to trash. You can restore it any
              time from the Trash view, or undo immediately after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
