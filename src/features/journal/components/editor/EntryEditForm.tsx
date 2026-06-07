import type { EntryMedia } from '#/types'
import { JournalEditor } from '#/features/journal/components/editor/JournalEditor'

type PendingMedia = { file: File; base64: string }

interface EntryEditFormProps {
  content: string
  onContentChange: (v: string) => void
  existingMedia: EntryMedia[]
  pendingMedia: PendingMedia[]
  removedMediaIds: number[]
  onAddMedia: (items: PendingMedia[]) => void
  onRemovePending: (index: number) => void
  onRemoveExisting: (id: number) => void
  onSave: () => void
  onCancel: () => void
  isSaveDisabled: boolean
  entryId?: number
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
  entryId,
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
      expandHref={entryId != null ? `/write?editId=${entryId}` : undefined}
    />
  )
}
