import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { Card } from '#/components/ui/card'
import { Pin, ArrowUpRight, Edit3, Trash2 } from 'lucide-react'
import { formatEntryDate } from '#/utils/journal'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownViewer } from '#/features/journal/components/MarkdownViewer'
import { MediaGrid } from '#/features/journal/components/MediaGrid'
import { EntryEditForm } from '#/features/journal/components/editor/EntryEditForm'
import type { Entry, EntryMedia } from '#/types'

interface EntryCardProps {
  entry: Entry
  onDelete: (id: number) => Promise<void>
  onUpdate: (
    id: number,
    content: string,
    addedMedia?: { file: File; base64: string }[],
    removedMediaIds?: number[],
  ) => Promise<Omit<Entry, 'media'>>
  onTogglePin: (id: number) => Promise<Omit<Entry, 'media'>>
  onTagClick: (tag: string) => void
}

export const EntryCard = memo(
  function EntryCardComponent({
    entry,
    onDelete,
    onUpdate,
    onTogglePin,
    onTagClick,
  }: EntryCardProps) {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState('')
    const [editPendingMedia, setEditPendingMedia] = useState<
      { file: File; base64: string }[]
    >([])
    const [editRemovedMediaIds, setEditRemovedMediaIds] = useState<number[]>([])

    const isPinned = entry.isPinned

    const startEdit = () => {
      setIsEditing(true)
      setEditContent(entry.content)
      setEditPendingMedia([])
      setEditRemovedMediaIds([])
    }

    const cancelEdit = () => setIsEditing(false)

    const handleSaveEdit = async () => {
      await onUpdate(
        entry.id,
        editContent.trim(),
        editPendingMedia,
        editRemovedMediaIds,
      )
      setIsEditing(false)
    }

    const isSaveDisabled =
      !editContent.trim() &&
      entry.media.filter((m: EntryMedia) => !editRemovedMediaIds.includes(m.id))
        .length === 0 &&
      editPendingMedia.length === 0

    const handleReadEntry = () => {
      navigate({ to: '/journal', search: { entryId: entry.id } })
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            className={`
              p-5 rounded-[1.2rem] border border-border/70
              bg-card/90 backdrop-blur-md
              transition-all duration-300 relative group overflow-hidden
              ${isPinned ? '' : ''}
            `}
            style={{
              boxShadow: isPinned
                ? `0 0 0 1px var(--primary), 0 8px 24px -8px color-mix(in srgb, var(--primary) 30%, transparent)`
                : '0 2px 12px rgba(0,0,0,0.06)',
              borderColor: isPinned ? 'var(--primary)' : undefined,
            }}
          >
            {/* Top metadata bar */}
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground/70 font-medium">
              <div className="flex items-center gap-2">
                {isPinned && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold tracking-wide uppercase">
                    <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                  </span>
                )}
                <span>{formatEntryDate(entry.createdAt)}</span>
                {entry.media.length > 0 && (
                  <span className="text-muted-foreground/40">
                    · {entry.media.length} photo
                    {entry.media.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Pin / Unpin */}
                <IconButton
                  tooltip={isPinned ? 'Unpin entry' : 'Pin to top'}
                  onClick={() => onTogglePin(entry.id)}
                  className={
                    isPinned
                      ? 'text-amber-500 bg-amber-500/10 opacity-100'
                      : 'text-muted-foreground/50 hover:text-amber-500 hover:bg-amber-500/10'
                  }
                >
                  <Pin
                    className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`}
                  />
                </IconButton>

                {/* Open in Journal page */}
                <IconButton
                  tooltip="Open in journal"
                  onClick={handleReadEntry}
                  className="hover:text-primary hover:bg-primary/10"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </IconButton>

                {/* Edit entry */}
                {!isEditing && (
                  <IconButton
                    tooltip="Edit entry"
                    onClick={startEdit}
                    className="hover:text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </IconButton>
                )}

                <IconButton
                  tooltip="Delete entry"
                  variant="danger"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </IconButton>
              </div>
            </div>

            {/* Content */}
            {isEditing ? (
              <EntryEditForm
                content={editContent}
                onContentChange={setEditContent}
                existingMedia={entry.media}
                pendingMedia={editPendingMedia}
                removedMediaIds={editRemovedMediaIds}
                onAddMedia={(items) =>
                  setEditPendingMedia((prev) => [...prev, ...items])
                }
                onRemovePending={(idx) =>
                  setEditPendingMedia((prev) =>
                    prev.filter((_, i) => i !== idx),
                  )
                }
                onRemoveExisting={(id) =>
                  setEditRemovedMediaIds((prev) => [...prev, id])
                }
                onSave={handleSaveEdit}
                onCancel={cancelEdit}
                isSaveDisabled={isSaveDisabled}
                entryId={entry.id}
              />
            ) : (
              <>
                <div
                  className="cursor-pointer"
                  onClick={handleReadEntry}
                  title="Open in journal to read full reflection"
                >
                  <MarkdownViewer
                    content={entry.content}
                    onTagClick={onTagClick}
                    className="line-clamp-2 text-sm leading-relaxed text-foreground/85"
                  />
                  {(entry.content.split('\n').length > 4 ||
                    entry.content.length > 240) && (
                    <p className="mt-2 text-xs font-semibold text-primary/60 hover:text-primary transition-colors">
                      Open in journal
                    </p>
                  )}
                </div>

                {entry.media.length > 0 && (
                  <div className="mt-3">
                    <MediaGrid media={entry.media} />
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.entry === nextProps.entry &&
      prevProps.onTagClick === nextProps.onTagClick
    )
  },
)
