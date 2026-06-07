import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { IconButton } from '#/components/ui/icon-button'
import {
  Image as ImageIcon,
  HelpCircle,
  Feather,
  Maximize2,
  X,
} from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'

import { useJournalEditor } from '#/hooks/use-journal-editor'

import { AutoSaveIndicator } from './AutoSaveIndicator'
import type { DraftStatus } from '#/hooks/use-draft'
import { readFilesAsBase64 } from '#/utils/file'

import { JournalBubbleMenu } from './JournalBubbleMenu'
import { JournalMarkdownGuide } from './JournalMarkdownGuide'
import { JournalDraftBanner } from './JournalDraftBanner'
import { EditorContent } from '@tiptap/react'
import type { EntryMedia } from '#/types'

type PendingMedia = { file: File; base64: string }

interface JournalEditorProps {
  value: string
  setValue: (v: string) => void
  onSave: () => void
  onCancel?: () => void
  // Pending (newly attached) media — controlled externally
  pendingMedia?: PendingMedia[]
  onAddMedia?: (items: PendingMedia[]) => void
  onRemovePending?: (index: number) => void
  // Existing (persisted) media — for edit mode
  existingMedia?: EntryMedia[]
  removedMediaIds?: number[]
  onRemoveExisting?: (id: number) => void
  // Draft state — only relevant for new-entry mode
  draftStatus?: DraftStatus
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void
  // Layout
  isExpandedPage?: boolean
  // When provided, the maximize button navigates here instead of /write
  expandHref?: string
  // Explicit override for save-disabled state
  isSaveDisabled?: boolean
}

export function JournalEditor({
  value,
  setValue,
  onSave,
  onCancel,
  pendingMedia = [],
  onAddMedia,
  onRemovePending,
  existingMedia,
  removedMediaIds,
  onRemoveExisting,
  draftStatus,
  draftError,
  retryDraftSave,
  copyDraft,
  isExpandedPage = false,
  expandHref,
  isSaveDisabled,
}: JournalEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMounted = useRef(true)
  const [showMdGuide, setShowMdGuide] = useState(false)

  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')

  const editor = useJournalEditor({
    content: value,
    placeholder: 'Start writing… anything you want to remember.',
    className: isExpandedPage
      ? 'prose-lg sm:prose-xl leading-relaxed min-h-[60vh] py-4'
      : 'leading-8 min-h-[220px] px-4 py-4 rounded-[1.4rem] border border-border/70 bg-background/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/20',
    editorProps: {
      handleKeyDown: (view, event) => {
        const ctrl = event.metaKey || event.ctrlKey
        if (ctrl && event.key === 'Enter') {
          event.preventDefault()
          if (view.state.doc.textContent.trim() || pendingMedia.length > 0)
            onSave()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      setValue(e.getMarkdown())
    },
  })

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getMarkdown()) {
      editor.setMarkdown(value)
    }
  }, [value, editor])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !onAddMedia) return
    const newMedia = await readFilesAsBase64(files)
    if (isMounted.current) {
      onAddMedia(newMedia)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const visibleExisting = existingMedia?.filter(
    (m) => !removedMediaIds?.includes(m.id),
  )

  const hasMedia = pendingMedia.length > 0 || (visibleExisting?.length ?? 0) > 0

  const saveDisabled =
    isSaveDisabled ??
    (!value.trim() &&
      pendingMedia.length === 0 &&
      (visibleExisting?.length ?? 0) === 0)

  return (
    <>
      <div
        className={`
          transition-all duration-300 flex flex-col relative
          ${
            isExpandedPage
              ? 'flex-1'
              : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.04))] backdrop-blur-2xl hover:border-primary/20 p-5 sm:p-6 rounded-[1.75rem] border border-border/70 shadow-[0_24px_80px_rgba(15,23,42,0.14)] space-y-4'
          }
        `}
      >
        {!isExpandedPage && (
          <div className="flex items-center justify-end border-b border-border/20 pb-3">
            <IconButton asChild tooltip="Expand to full page">
              <Link to={expandHref ?? '/write'}>
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
            </IconButton>
          </div>
        )}

        <div
          className={`relative ${isExpandedPage ? 'flex-1 flex flex-col min-h-0 pt-16 sm:pt-20' : ''}`}
        >
          {editor ? <JournalBubbleMenu editor={editor} /> : null}

          <EditorContent
            editor={editor}
            className={isExpandedPage ? 'flex-1 overflow-y-visible' : ''}
          />

          <AnimatePresence>
            {showMdGuide && (
              <JournalMarkdownGuide isExpandedPage={isExpandedPage} />
            )}
          </AnimatePresence>
        </div>

        {draftStatus === 'error' && (
          <JournalDraftBanner
            draftError={draftError}
            retryDraftSave={retryDraftSave}
            copyDraft={copyDraft}
          />
        )}

        {/* Media gallery — existing + pending */}
        {hasMedia && (
          <div className="flex flex-wrap gap-3 pt-3">
            {visibleExisting?.map((m) => (
              <div
                key={`existing-${m.id}`}
                className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/50"
              >
                <img
                  src={`local-media://${m.id}`}
                  className="w-full h-full object-cover"
                  alt=""
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = `file://${m.filePath}`
                  }}
                />
                {onRemoveExisting && (
                  <IconButton
                    tooltip="Remove image"
                    onClick={() => onRemoveExisting(m.id)}
                    className="absolute top-1 right-1 p-0.5 w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </IconButton>
                )}
              </div>
            ))}

            {pendingMedia.map((item, idx) => (
              <div
                key={`pending-${idx}`}
                className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/50"
              >
                <img
                  src={item.base64}
                  alt="Pending attachment"
                  className="w-full h-full object-cover"
                />
                {onRemovePending && (
                  <IconButton
                    tooltip="Remove image"
                    onClick={() => onRemovePending(idx)}
                    className="absolute top-1 right-1 p-0.5 w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div
          className={`flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between ${isExpandedPage ? 'mt-8' : 'border-t border-border/10 mt-4'}`}
        >
          <div className="flex items-center gap-1 relative">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mr-3">
              <Feather className="w-3.5 h-3.5" />
              {editor
                ? editor.getMarkdown().trim().split(/\s+/).filter(Boolean)
                    .length
                : 0}{' '}
              words
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
              <IconButton
                tooltip="Attach image"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4" />
              </IconButton>
            )}

            <IconButton
              tooltip={
                showMdGuide ? 'Hide markdown guide' : 'Show markdown guide'
              }
              active={showMdGuide}
              onClick={() => setShowMdGuide((v) => !v)}
            >
              <HelpCircle className="w-4 h-4" />
            </IconButton>
          </div>

          {!isExpandedPage && (
            <div className="flex flex-col items-end gap-2">
              <AutoSaveIndicator
                status={draftStatus ?? 'idle'}
                error={draftError}
              />
              <div className="flex items-center gap-2">
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    className="h-9"
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
                  {onCancel ? 'Save Changes' : 'Save entry'}
                  {!onCancel && (
                    <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
                      {isMac ? '⌘' : 'Ctrl'} ↵
                    </Kbd>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
