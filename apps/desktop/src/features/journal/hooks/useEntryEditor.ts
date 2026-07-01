import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { readFilesAsBase64 } from '#/utils/file'
import type { Entry, JournalMood } from '#/types'
import { useEditorStore } from '#/stores/editor-store'
import type { PendingMedia } from '#/stores/editor-store'

/**
 * ViewModel interface for the Journal Editor.
 * Exposes methods to modify global editor state and save entries.
 */
export interface EntryEditorViewModel {
  isEditing: boolean
  content: string
  setContent: (v: string | ((prev: string) => string)) => void
  mood: JournalMood | null
  setMood: (mood: JournalMood | null) => void
  pendingMedia: PendingMedia[]
  removedMediaIds: number[]
  startEdit: (entry: Entry) => void
  cancelEdit: () => void
  addMedia: (files: File[]) => void
  removePending: (index: number) => void
  removeExisting: (id: number) => void
  save: () => Promise<Entry | Omit<Entry, 'media'> | undefined>
  isSaving: boolean
  isSaveDisabled: boolean
  wordCount: number
}

/**
 * Bridges `useEditorStore` with React Query mutations.
 * Editor state is kept in Zustand to preserve drafts across route navigation.
 */
export function useEntryEditor(activeEntry?: Entry): EntryEditorViewModel {
  const { updateEntry, createEntry } = useJournalMutations()

  const content = useEditorStore((s) => s.content)
  const mood = useEditorStore((s) => s.mood)
  const isEditing = useEditorStore((s) => s.isEditing)
  const activeEntryId = useEditorStore((s) => s.activeEntryId)
  const pendingMedia = useEditorStore((s) => s.pendingMedia)
  const removedMediaIds = useEditorStore((s) => s.removedMediaIds)

  const setContentStore = useEditorStore((s) => s.setContent)
  const setMoodStore = useEditorStore((s) => s.setMood)
  const setTypingStore = useEditorStore((s) => s.setTyping)
  const addMediaStore = useEditorStore((s) => s.addMedia)
  const removePendingStore = useEditorStore((s) => s.removePending)

  const startEditStore = useEditorStore((s) => s.startEdit)
  const cancelEditStore = useEditorStore((s) => s.cancelEdit)
  const clearStore = useEditorStore((s) => s.clear)
  const removeExistingStore = useEditorStore((s) => s.removeExisting)

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setContent = useCallback(
    (value: string | ((prev: string) => string)) => {
      setContentStore(value)

      setTypingStore(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStore(false)
      }, 2000)
    },
    [setContentStore, setTypingStore],
  )

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      setTypingStore(false)
    }
  }, [setTypingStore])

  const removeExisting = useCallback(
    (id: number) => {
      removeExistingStore(id)
    },
    [removeExistingStore],
  )

  const [isSaving, setIsSaving] = useState(false)

  const save = useCallback(async () => {
    if (isSaving) return undefined

    setIsSaving(true)
    try {
      const trimmed = content.trim()

      const base64Media = await readFilesAsBase64(
        pendingMedia.map((m) => m.file),
      )
      const apiMedia = base64Media.map((m) => ({ base64Data: m.base64 }))

      if (!isEditing) {
        const entry = await createEntry.mutateAsync({
          content: trimmed,
          mood,
          media: apiMedia,
        })
        if (entry) {
          clearStore()
        }
        return entry
      }

      if (activeEntryId) {
        const updated = await updateEntry.mutateAsync({
          id: activeEntryId,
          content: trimmed,
          mood,
          addedMedia: apiMedia,
          removedMediaIds,
        })
        cancelEditStore()
        return updated
      }

      return undefined
    } finally {
      setIsSaving(false)
    }
  }, [
    content,
    mood,
    pendingMedia,
    isEditing,
    activeEntryId,
    removedMediaIds,
    createEntry,
    updateEntry,
    clearStore,
    cancelEditStore,
    isSaving,
  ])

  const isSaveDisabled = useMemo(() => {
    const trimmed = content.trim()

    if (!isEditing) {
      return !trimmed && pendingMedia.length === 0 && !mood
    }

    if (activeEntry && activeEntryId === activeEntry.id) {
      const contentChanged = trimmed !== activeEntry.content
      const moodChanged = mood !== activeEntry.mood
      const mediaChanged = pendingMedia.length > 0 || removedMediaIds.length > 0

      return !contentChanged && !moodChanged && !mediaChanged
    }

    return !trimmed && pendingMedia.length === 0 && !mood
  }, [
    isEditing,
    content,
    mood,
    pendingMedia,
    removedMediaIds,
    activeEntryId,
    activeEntry,
  ])

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length
  }, [content])

  return {
    isEditing,
    content,
    setContent,
    mood,
    setMood: setMoodStore,
    pendingMedia,
    removedMediaIds,
    startEdit: startEditStore,
    cancelEdit: cancelEditStore,
    addMedia: addMediaStore,
    removePending: removePendingStore,
    removeExisting,
    save,
    isSaving,
    isSaveDisabled,
    wordCount,
  }
}
