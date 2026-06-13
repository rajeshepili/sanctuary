import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { readFilesAsBase64 } from '#/utils/file'
import type { Entry, EntryMedia } from '#/types'

export type PendingMedia = { file: File; url: string }

export interface EntryEditorViewModel {
  isEditing: boolean
  content: string
  setContent: (v: string | ((prev: string) => string)) => void
  pendingMedia: PendingMedia[]
  removedMediaIds: number[]
  startEdit: () => void
  cancelEdit: () => void
  addMedia: (files: File[]) => void
  removePending: (index: number) => void
  removeExisting: (id: number) => void
  save: () => Promise<Entry | Omit<Entry, 'media'> | undefined>
  isSaveDisabled: boolean
  wordCount: number
}

/**
 * Manages the high-level semantic state and actions for the journal editor.
 * Encapsulates isEditing, staging state (content, media), and coordinate mutations.
 */
export function useEntryEditor(activeEntry?: Entry): EntryEditorViewModel {
  const { updateEntry, createEntry } = useJournalMutations()

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([])

  // Cleanup Object URLs on unmount only
  const pendingMediaRef = useRef(pendingMedia)
  useEffect(() => {
    pendingMediaRef.current = pendingMedia
  }, [pendingMedia])

  useEffect(() => {
    return () => {
      pendingMediaRef.current.forEach((m) => URL.revokeObjectURL(m.url))
    }
  }, [])

  const startEdit = useCallback(() => {
    if (!activeEntry) return
    setIsEditing(true)
    setContent(activeEntry.content)
    setPendingMedia([])
    setRemovedMediaIds([])
  }, [activeEntry])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setPendingMedia([])
    setRemovedMediaIds([])
  }, [])

  const addMedia = useCallback((files: File[]) => {
    const newItems = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPendingMedia((prev) => [...prev, ...newItems])
  }, [])

  const removePending = useCallback((index: number) => {
    setPendingMedia((prev) => {
      const item = prev[index]
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const removeExisting = useCallback((id: number) => {
    setRemovedMediaIds((prev) => [...prev, id])
  }, [])

  const save = useCallback(async () => {
    const trimmed = content.trim()
    
    // Convert File objects to Base64 only for the API call
    const base64Media = await readFilesAsBase64(pendingMedia.map(m => m.file))
    const apiMedia = base64Media.map(m => ({ base64Data: m.base64 }))

    if (!activeEntry) {
      const entry = await createEntry(trimmed, apiMedia)
      if (entry) {
        setContent('')
        setPendingMedia([])
      }
      return entry
    }

    const updated = await updateEntry(
      activeEntry.id,
      trimmed,
      apiMedia,
      removedMediaIds,
    )
    setIsEditing(false)
    return updated
  }, [activeEntry, content, pendingMedia, removedMediaIds, createEntry, updateEntry])

  const isSaveDisabled = useMemo(() => {
    const trimmed = content.trim()
    if (!activeEntry) {
      return !trimmed && pendingMedia.length === 0
    }

    const visibleExistingCount = activeEntry.media.filter(
      (m: EntryMedia) => !removedMediaIds.includes(m.id),
    ).length

    return !trimmed && pendingMedia.length === 0 && visibleExistingCount === 0
  }, [activeEntry, content, pendingMedia, removedMediaIds])

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length
  }, [content])

  return {
    isEditing,
    content,
    setContent,
    pendingMedia,
    removedMediaIds,
    startEdit,
    cancelEdit,
    addMedia,
    removePending,
    removeExisting,
    save,
    isSaveDisabled,
    wordCount,
  }
}
