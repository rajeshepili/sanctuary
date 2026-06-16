import { useCallback, useMemo, useEffect, useRef } from 'react'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { readFilesAsBase64 } from '#/utils/file'
import type { Entry, EntryMedia } from '#/types'
import { useEditorStore } from '#/stores/editor-store'
import type { PendingMedia } from '#/stores/editor-store'

export interface EntryEditorViewModel {
  isEditing: boolean
  content: string
  setContent: (v: string | ((prev: string) => string)) => void
  pendingMedia: PendingMedia[]
  removedMediaIds: number[]
  startEdit: (entry: Entry) => void
  cancelEdit: () => void
  addMedia: (files: File[]) => void
  removePending: (index: number) => void
  removeExisting: (id: number) => void
  save: () => Promise<Entry | Omit<Entry, 'media'> | undefined>
  isSaveDisabled: boolean
  wordCount: number
}

export function useEntryEditor(activeEntry?: Entry): EntryEditorViewModel {
  const { updateEntry, createEntry } = useJournalMutations()
  
  const content = useEditorStore((s) => s.content)
  const isEditing = useEditorStore((s) => s.isEditing)
  const activeEntryId = useEditorStore((s) => s.activeEntryId)
  const pendingMedia = useEditorStore((s) => s.pendingMedia)
  const removedMediaIds = useEditorStore((s) => s.removedMediaIds)
  
  const setContentStore = useEditorStore((s) => s.setContent)
  const setTypingStore = useEditorStore((s) => s.setTyping)
  const addMediaStore = useEditorStore((s) => s.addMedia)
  const removePendingStore = useEditorStore((s) => s.removePending)

  const startEditStore = useEditorStore((s) => s.startEdit)
  const cancelEditStore = useEditorStore((s) => s.cancelEdit)
  const clearStore = useEditorStore((s) => s.clear)
  const removeExistingStore = useEditorStore((s) => s.removeExisting)

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)


  const setContent = useCallback((value: string | ((prev: string) => string)) => {
    setContentStore(value)
    
    setTypingStore(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStore(false)
    }, 2000)
  }, [setContentStore, setTypingStore])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      setTypingStore(false)
    }
  }, [setTypingStore])

  const removeExisting = useCallback((id: number) => {
    removeExistingStore(id)
  }, [removeExistingStore])

  const save = useCallback(async () => {
    const trimmed = content.trim()
    
    const base64Media = await readFilesAsBase64(pendingMedia.map(m => m.file))
    const apiMedia = base64Media.map(m => ({ base64Data: m.base64 }))

    if (!isEditing) {
      const entry = await createEntry.mutateAsync({ value: trimmed, apiMedia })
      if (entry) {
        clearStore()
      }
      return entry
    }

    if (activeEntryId) {
      const updated = await updateEntry.mutateAsync({ id: activeEntryId, content: trimmed, addedMedia: apiMedia, removedMediaIds })
      cancelEditStore()
      return updated
    }
    
    return undefined
  }, [content, pendingMedia, isEditing, activeEntryId, removedMediaIds, createEntry, updateEntry, clearStore, cancelEditStore])

  const isSaveDisabled = useMemo(() => {
    const trimmed = content.trim()
    
    if (!isEditing) {
      return !trimmed && pendingMedia.length === 0
    }

    if (activeEntry && activeEntryId === activeEntry.id) {
        const visibleExistingCount = activeEntry.media.filter(
          (m: EntryMedia) => !removedMediaIds.includes(m.id),
        ).length
        return !trimmed && pendingMedia.length === 0 && visibleExistingCount === 0
    }

    return !trimmed && pendingMedia.length === 0
  }, [isEditing, content, pendingMedia, removedMediaIds, activeEntryId, activeEntry])

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length
  }, [content])

  return {
    isEditing,
    content,
    setContent,
    pendingMedia,
    removedMediaIds,
    startEdit: startEditStore,
    cancelEdit: cancelEditStore,
    addMedia: addMediaStore,
    removePending: removePendingStore,
    removeExisting,
    save,
    isSaveDisabled,
    wordCount,
  }
}
