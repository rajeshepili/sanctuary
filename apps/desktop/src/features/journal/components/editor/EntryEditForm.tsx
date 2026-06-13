import type { EntryMedia } from '#/types'
import { JournalEditor } from '#/features/journal/components/editor/JournalEditor'
import type { DraftStatus } from '#/hooks/use-draft'

type PendingMedia = { file: File; url: string }

interface EntryEditFormProps {
  content: string
  onContentChange: (v: string | ((prev: string) => string)) => void
  existingMedia: EntryMedia[]
  pendingMedia: PendingMedia[]
  removedMediaIds: number[]
  onAddMedia: (files: File[]) => void
  onRemovePending: (index: number) => void
  onRemoveExisting: (id: number) => void
  onSave: () => void
  onCancel: () => void
  isSaveDisabled: boolean
  entryId?: number
  draftStatus?: DraftStatus
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void
}

export function EntryEditForm({
  content,
  onContentChange,
  existingMedia,
  pendingMedia,
  removedMediaIds,
  onAddMedia,
  onRemovePending,
  onRemoveExisting,
  onSave,
  onCancel,
  isSaveDisabled,
  draftStatus,
  draftError,
  retryDraftSave,
  copyDraft,
}: EntryEditFormProps) {
  return (
    <JournalEditor
      value={content}
      setValue={onContentChange}
      onSave={onSave}
      onCancel={onCancel}
      pendingMedia={pendingMedia}
      onAddMedia={onAddMedia}
      onRemovePending={onRemovePending}
      existingMedia={existingMedia}
      removedMediaIds={removedMediaIds}
      onRemoveExisting={onRemoveExisting}
      isSaveDisabled={isSaveDisabled}
      draftStatus={draftStatus}
      draftError={draftError}
      retryDraftSave={retryDraftSave}
      copyDraft={copyDraft}
      isInlinePane
    />
  )
}
