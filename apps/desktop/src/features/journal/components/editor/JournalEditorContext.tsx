import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import type { DraftStatus } from '#/hooks/use-draft'
import type { EntryMedia, JournalMood } from '#/types'

export type PendingMedia = { file: File; url: string }

export interface JournalEditorContextValue {
  // Editor core
  editor: Editor | null
  wordCount: number
  value: string
  setValue: (v: string | ((prev: string) => string)) => void
  mood: JournalMood | null
  setMood: (mood: JournalMood | null) => void
  onSave: () => void
  onCancel?: () => void

  // Media
  pendingMedia: PendingMedia[]
  onAddMedia?: (files: File[]) => void
  onRemovePending?: (index: number) => void
  existingMedia?: EntryMedia[]
  removedMediaIds?: number[]
  onRemoveExisting?: (id: number) => void

  // UI State
  showMdGuide: boolean
  setShowMdGuide: (v: boolean | ((prev: boolean) => boolean)) => void
  /** True when rendered inside the split-pane viewer — removes card wrapper, fills height naturally */
  isInlinePane?: boolean
  isSaving?: boolean
  isSaveDisabled?: boolean

  // Drafts
  draftStatus?: DraftStatus
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void

  // Media Picker helpers (from useMediaPicker)
  openMediaPicker: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const JournalEditorContext = createContext<JournalEditorContextValue | null>(
  null,
)

export function useJournalEditorContext() {
  const context = useContext(JournalEditorContext)
  if (!context) {
    throw new Error(
      'useJournalEditorContext must be used within a JournalEditorProvider',
    )
  }
  return context
}

interface JournalEditorProviderProps {
  children: ReactNode
  value: JournalEditorContextValue
}

export function JournalEditorProvider({
  children,
  value,
}: JournalEditorProviderProps) {
  return (
    <JournalEditorContext.Provider value={value}>
      {children}
    </JournalEditorContext.Provider>
  )
}
