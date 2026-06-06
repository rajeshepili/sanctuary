import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { AutoSaveIndicator } from '#/components/journal/editor/AutoSaveIndicator'
import { JournalEditor } from '#/components/journal/editor/JournalEditor'
import { ScrollArea } from '#/components/ui/scroll-area'
import { useJournalEntryState } from '#/hooks/use-journal-entry-state'
import { useKeyboardShortcut } from '#/hooks/use-keyboard-shortcut'
import { useJournalQueries } from '#/features/journal/journal.queries'
import { useJournalMutations } from '#/features/journal/journal.mutations'

export const Route = createFileRoute('/__app/write')({
  validateSearch: z.object({
    editId: z.number().optional(),
  }),
  head: () => ({ meta: [{ title: 'Write — Sanctuary' }] }),
  component: WritePage,
})

function WritePage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const editId = search.editId

  const { entries } = useJournalQueries()
  const existingEntry = editId ? entries.find((e) => e.id === editId) : null

  // State for editing an existing entry
  const [editContent, setEditContent] = useState(existingEntry?.content || '')
  const [editPendingMedia, setEditPendingMedia] = useState<
    { file: File; base64: string }[]
  >([])
  const [editRemovedMediaIds, setEditRemovedMediaIds] = useState<number[]>([])

  const { updateEntry } = useJournalMutations()

  useEffect(() => {
    if (existingEntry && !editContent) {
      setEditContent(existingEntry.content)
    }
  }, [existingEntry])

  // State for creating a new entry (auto-saved as draft)
  const draftState = useJournalEntryState(() => navigate({ to: '/' }))

  useKeyboardShortcut('Escape', () => navigate({ to: '/' }))

  const isEditing = !!existingEntry

  const handleSaveEdit = async () => {
    if (!existingEntry) return
    await updateEntry(
      existingEntry.id,
      editContent.trim(),
      editPendingMedia,
      editRemovedMediaIds,
    )
    navigate({ to: '/' })
  }

  const value = isEditing ? editContent : draftState.value
  const setValue = isEditing ? setEditContent : draftState.setValue
  const pendingMedia = isEditing ? editPendingMedia : draftState.pendingMedia
  const handleSave = isEditing ? handleSaveEdit : draftState.handleSave

  const onAddMedia = isEditing
    ? (items: { file: File; base64: string }[]) =>
        setEditPendingMedia((prev) => [...prev, ...items])
    : (items: { file: File; base64: string }[]) =>
        draftState.setPendingMedia((prev) => [...prev, ...items])

  const onRemovePending = isEditing
    ? (idx: number) =>
        setEditPendingMedia((prev) => prev.filter((_, i) => i !== idx))
    : (idx: number) =>
        draftState.setPendingMedia((prev) => prev.filter((_, i) => i !== idx))

  const draftStatus = isEditing ? ('idle' as const) : draftState.draftStatus
  const draftError = isEditing ? null : draftState.draftError

  const isSaveDisabled = isEditing
    ? !editContent.trim() &&
      existingEntry.media.filter((m) => !editRemovedMediaIds.includes(m.id))
        .length === 0 &&
      editPendingMedia.length === 0
    : !value.trim() && pendingMedia.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-3xl"
    >
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-20">
        <button
          onClick={() => {
            if (window.history.length > 2) {
              window.history.back()
            } else {
              navigate({ to: '/' })
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-foreground/5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-20 flex items-center gap-4">
        {!isEditing && (
          <AutoSaveIndicator status={draftStatus} error={draftError} />
        )}
        <Button onClick={() => handleSave()} disabled={isSaveDisabled}>
          {isEditing ? 'Save Changes' : 'Save entry'}
          <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
            {typeof navigator !== 'undefined' &&
            navigator.platform.toLowerCase().includes('mac')
              ? '⌘'
              : 'Ctrl'}
            ↵
          </Kbd>
        </Button>
      </div>

      <ScrollArea className="h-full w-full">
        <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-4 sm:px-8 py-24 sm:py-32 space-y-6">
          <JournalEditor
            value={value}
            setValue={setValue}
            onSave={handleSave}
            pendingMedia={pendingMedia}
            onAddMedia={onAddMedia}
            onRemovePending={onRemovePending}
            existingMedia={isEditing ? existingEntry.media : undefined}
            removedMediaIds={isEditing ? editRemovedMediaIds : undefined}
            onRemoveExisting={
              isEditing
                ? (id) => setEditRemovedMediaIds((p) => [...p, id])
                : undefined
            }
            draftStatus={draftStatus}
            draftError={draftError}
            retryDraftSave={
              isEditing ? undefined : draftState.handleRetryDraftSave
            }
            copyDraft={isEditing ? undefined : draftState.handleCopyDraft}
            isExpandedPage={true}
            isSaveDisabled={isSaveDisabled}
          />
        </div>
      </ScrollArea>
    </motion.div>
  )
}
