import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { IconButton } from '#/components/ui/icon-button'
import { Image as ImageIcon, HelpCircle, Feather, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { EditorContent } from '@tiptap/react'
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from '#/components/ui/attachment'

import { useEditorInstance } from '#/features/journal/hooks/useEditorInstance'
import { useMediaPicker } from '#/features/journal/hooks/useMediaPicker'
import { getMediaAssetUrl } from '#/infrastructure/media/media.urls'

import { AutoSaveIndicator } from './AutoSaveIndicator'
import type { DraftStatus } from '#/hooks/use-draft'
import { JournalBubbleMenu } from './JournalBubbleMenu'
import { JournalMarkdownGuide } from './JournalMarkdownGuide'
import { JournalDraftBanner } from './JournalDraftBanner'
import type { EntryMedia, JournalMood } from '#/types'
import {
  JournalEditorProvider,
  useJournalEditorContext,
} from './JournalEditorContext'
import type {
  PendingMedia,
  JournalEditorContextValue,
} from './JournalEditorContext'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { isMac } from '#/utils/platform'
import { MoodSelector } from './MoodSelector'

interface JournalEditorProps {
  value: string
  setValue: (v: string | ((prev: string) => string)) => void
  mood: JournalMood | null
  setMood: (mood: JournalMood | null) => void
  onSave: () => void
  onCancel?: () => void
  // Pending (newly attached) media
  pendingMedia?: PendingMedia[]
  onAddMedia?: (files: File[]) => void
  onRemovePending?: (index: number) => void
  // Existing (persisted) media — for edit mode
  existingMedia?: EntryMedia[]
  removedMediaIds?: number[]
  onRemoveExisting?: (id: number) => void
  // Draft state
  draftStatus?: DraftStatus
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void
  // Layout
  /** True when embedded in split-pane viewer — renders without card wrapper */
  isInlinePane?: boolean
  isSaving?: boolean
  isSaveDisabled?: boolean
}

export function JournalEditor(props: JournalEditorProps) {
  const [showMdGuide, setShowMdGuide] = useState(false)

  const { editor, wordCount } = useEditorInstance({
    value: props.value,
    setValue: props.setValue,
    onSave: props.onSave,
    isInlinePane: props.isInlinePane,
  })

  const {
    fileInputRef,
    open: openMediaPicker,
    handleFileChange,
  } = useMediaPicker({
    onAddMedia: props.onAddMedia ?? (() => {}),
  })

  const contextValue: JournalEditorContextValue = {
    ...props,
    pendingMedia: props.pendingMedia ?? [],
    editor,
    wordCount,
    showMdGuide,
    setShowMdGuide,
    isInlinePane: props.isInlinePane ?? false,
    isSaving: props.isSaving ?? false,
    openMediaPicker,
    fileInputRef,
    handleFileChange,
  }

  return (
    <JournalEditorProvider value={contextValue}>
      <JournalEditorRoot>
        <JournalEditorHeader />
        <JournalEditorMain>
          <JournalEditorContent />
        </JournalEditorMain>
        <JournalEditorBanner />
        <JournalEditorMediaGallery />
        <MoodSelector />
        <JournalEditorToolbar />
      </JournalEditorRoot>
    </JournalEditorProvider>
  )
}

function JournalEditorRoot({ children }: { children: React.ReactNode }) {
  const { isInlinePane } = useJournalEditorContext()
  return (
    <div
      className={`
        transition-all duration-300 flex flex-col relative
        ${
          isInlinePane
            ? 'flex-1 flex flex-col min-h-0'
            : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.04))] backdrop-blur-2xl hover:border-primary/20 p-5 sm:p-6 rounded-[1.75rem] border border-border/70 shadow-[0_24px_80px_rgba(15,23,42,0.14)] space-y-4'
        }
      `}
    >
      {children}
    </div>
  )
}

function JournalEditorHeader() {
  return null
}

function JournalEditorMain({ children }: { children: React.ReactNode }) {
  const { isInlinePane } = useJournalEditorContext()
  return (
    <div
      className={`relative ${
        isInlinePane ? 'flex-1 flex flex-col min-h-0' : ''
      }`}
    >
      {children}
    </div>
  )
}

function JournalEditorContent() {
  const { editor, isInlinePane, showMdGuide } = useJournalEditorContext()

  const content = (
    <FeatureErrorBoundary
      title="Editor Content"
      className={isInlinePane ? 'flex-1 flex flex-col min-h-0' : ''}
    >
      {editor ? <JournalBubbleMenu editor={editor} /> : null}

      {/* 
        For card mode (home dashboard), we wrap the EditorContent in a styled div with
        overflow-hidden and border-radius. The inner EditorContent handles the actual
        scrolling (overflow-y-auto), but the outer wrapper cleanly clips the native
        scrollbar so it doesn't bleed out of the rounded corners.
      */}
      {isInlinePane ? (
        <EditorContent
          editor={editor}
          className="flex-1 flex flex-col min-h-0"
        />
      ) : (
        <div className="relative rounded-[1.4rem] border border-border/70 bg-background/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden focus-within:border-primary/35 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <EditorContent editor={editor} className="" />
        </div>
      )}

      <AnimatePresence>
        {showMdGuide && <JournalMarkdownGuide />}
      </AnimatePresence>
    </FeatureErrorBoundary>
  )

  // Inline pane / card mode all just return the content.
  // We will handle the scrollbar clipping directly via standard CSS on the wrapper.
  return content
}

function JournalEditorBanner() {
  const { draftStatus, draftError, retryDraftSave, copyDraft } =
    useJournalEditorContext()
  if (draftStatus !== 'error') return null

  return (
    <JournalDraftBanner
      draftError={draftError}
      retryDraftSave={retryDraftSave}
      copyDraft={copyDraft}
    />
  )
}

function JournalEditorMediaGallery() {
  const {
    existingMedia,
    removedMediaIds,
    onRemoveExisting,
    pendingMedia,
    onRemovePending,
  } = useJournalEditorContext()

  const visibleExisting = existingMedia?.filter(
    (m) => !removedMediaIds?.includes(m.id),
  )

  const hasMedia = pendingMedia.length > 0 || (visibleExisting?.length ?? 0) > 0
  if (!hasMedia) return null

  return (
    <div className="pt-3">
      <AttachmentGroup>
        {visibleExisting?.map((m) => {
          const fileName = m.filePath.split(/[/\\]/).pop() || 'Attachment'
          const mbSize = (m.fileSize / 1024 / 1024).toFixed(2)

          return (
            <Attachment key={`existing-${m.id}`} size="sm">
              <AttachmentMedia variant="image">
                <img
                  src={getMediaAssetUrl(m.id, true)}
                  className="w-full h-full"
                  alt=""
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{fileName}</AttachmentTitle>
                <AttachmentDescription>
                  Image · {mbSize} MB
                </AttachmentDescription>
              </AttachmentContent>
              {onRemoveExisting && (
                <AttachmentActions>
                  <AttachmentAction
                    onClick={() => onRemoveExisting(m.id)}
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </AttachmentAction>
                </AttachmentActions>
              )}
            </Attachment>
          )
        })}

        {pendingMedia.map((item, idx) => {
          const mbSize = (item.file.size / 1024 / 1024).toFixed(2)
          return (
            <Attachment key={`pending-${idx}`} size="sm" state="uploading">
              <AttachmentMedia variant="image">
                <img
                  src={item.url}
                  alt="Pending attachment"
                  className="w-full h-full object-cover"
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{item.file.name}</AttachmentTitle>
                <AttachmentDescription>
                  Image · {mbSize} MB
                </AttachmentDescription>
              </AttachmentContent>
              {onRemovePending && (
                <AttachmentActions>
                  <AttachmentAction
                    onClick={() => onRemovePending(idx)}
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </AttachmentAction>
                </AttachmentActions>
              )}
            </Attachment>
          )
        })}
      </AttachmentGroup>
    </div>
  )
}

function JournalEditorToolbar() {
  const {
    wordCount,
    onAddMedia,
    openMediaPicker,
    fileInputRef,
    handleFileChange,
    showMdGuide,
    setShowMdGuide,
    draftStatus,
    draftError,
    onCancel,
    onSave,
    isSaving,
    isSaveDisabled,
    value,
    pendingMedia,
    existingMedia,
    removedMediaIds,
  } = useJournalEditorContext()

  const saveDisabled = useMemo(() => {
    if (isSaving) return true
    if (isSaveDisabled !== undefined) return isSaveDisabled

    const visibleExistingCount =
      existingMedia?.filter((m) => !removedMediaIds?.includes(m.id)).length ?? 0

    return (
      !value.trim() && pendingMedia.length === 0 && visibleExistingCount === 0
    )
  }, [
    isSaveDisabled,
    value,
    pendingMedia,
    existingMedia,
    removedMediaIds,
    isSaving,
  ])

  return (
    <div
      className={`flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between border-t border-border/10 mt-4`}
    >
      <div className="flex items-center gap-1 relative">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mr-3">
          <Feather className="w-3.5 h-3.5" />
          {wordCount} words
        </span>

        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {onAddMedia && (
          <IconButton tooltip="Attach image" onClick={openMediaPicker}>
            <ImageIcon className="w-4 h-4" />
          </IconButton>
        )}

        <IconButton
          tooltip={showMdGuide ? 'Hide markdown guide' : 'Show markdown guide'}
          active={showMdGuide}
          onClick={() => setShowMdGuide((v) => !v)}
        >
          <HelpCircle className="w-4 h-4" />
        </IconButton>
      </div>

      <div className="flex flex-col items-end gap-2">
        <AutoSaveIndicator status={draftStatus ?? 'idle'} error={draftError} />
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="h-9"
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={onSave}
            size={onCancel ? 'sm' : 'default'}
            className={onCancel ? 'h-9' : ''}
            disabled={saveDisabled}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <>
                {onCancel ? 'Save Changes' : 'Save entry'}
                {!onCancel && (
                  <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px] ml-2">
                    {isMac() ? '⌘' : 'Ctrl'} ↵
                  </Kbd>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
