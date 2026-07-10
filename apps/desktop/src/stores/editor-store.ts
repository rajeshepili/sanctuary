import { create } from 'zustand'
import type { Entry, JournalMood } from '#/types'

export type PendingMedia = { file: File; url: string }

interface EditorState {
  // Common state
  content: string
  mood: JournalMood | null
  pendingMedia: PendingMedia[]
  isTyping: boolean

  // Edit mode state
  isEditing: boolean
  activeEntryId: number | null
  removedMediaIds: number[]

  // Actions
  setContent: (content: string | ((prev: string) => string)) => void
  setTyping: (isTyping: boolean) => void
  addMedia: (files: File[]) => void
  removePending: (index: number) => void
  clearMedia: () => void

  startEdit: (entry: Entry) => void
  cancelEdit: () => void
  clear: () => void
  removeExisting: (id: number) => void
  setMood: (mood: JournalMood | null) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: '',
  mood: null,
  pendingMedia: [],
  isTyping: false,
  isEditing: false,
  activeEntryId: null,
  removedMediaIds: [],

  setMood: (mood) => set({ mood }),

  setContent: (content) => {
    if (typeof content === 'function') {
      set((state) => ({ content: content(state.content) }))
    } else {
      set({ content })
    }
  },

  setTyping: (isTyping) => set({ isTyping }),

  addMedia: (files) => {
    const newItems = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    set((state) => ({ pendingMedia: [...state.pendingMedia, ...newItems] }))
  },

  removePending: (index) => {
    set((state) => {
      const item = state.pendingMedia[index]
      item.url && URL.revokeObjectURL(item.url)
      return {
        pendingMedia: state.pendingMedia.filter((_, i) => i !== index),
      }
    })
  },

  clearMedia: () => {
    get().pendingMedia.forEach((m) => URL.revokeObjectURL(m.url))
    set({ pendingMedia: [] })
  },

  startEdit: (entry) => {
    get().clearMedia()
    set({
      isEditing: true,
      activeEntryId: entry.id,
      content: entry.content,
      mood: entry.mood ?? null,
      removedMediaIds: [],
    })
  },

  cancelEdit: () => {
    get().clearMedia()
    set({
      isEditing: false,
      activeEntryId: null,
      content: '',
      mood: null,
      removedMediaIds: [],
    })
  },

  clear: () => {
    get().clearMedia()
    set({
      content: '',
      mood: null,
      isEditing: false,
      activeEntryId: null,
      removedMediaIds: [],
      isTyping: false,
    })
  },

  removeExisting: (id) =>
    set((state) => ({ removedMediaIds: [...state.removedMediaIds, id] })),
}))
