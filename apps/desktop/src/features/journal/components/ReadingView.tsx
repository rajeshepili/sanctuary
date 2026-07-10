import { useEffect, useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit3, Pin, Trash2 } from 'lucide-react'
import { formatEntryDate } from '#/utils/date'
import { getMoodDetails } from '#/features/journal/journal.moods'
import { MarkdownViewer } from '#/features/journal/components/MarkdownViewer'
import { MediaGrid } from '#/features/journal/components/MediaGrid'
import { IconButton } from '#/components/ui/icon-button'
import type { Entry } from '#/types'

// ---------------------------------------------------------------------------
// Mood ambient palette
// ---------------------------------------------------------------------------
const MOOD_AMBIENTS: Record<string, string> = {
  happy:
    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 70%)',
  calm: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(20,184,166,0.12) 0%, transparent 70%)',
  focused:
    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.14) 0%, transparent 70%)',
  anxious:
    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,85,247,0.12) 0%, transparent 70%)',
  sad: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)',
  energetic:
    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(244,63,94,0.12) 0%, transparent 70%)',
  tired:
    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(100,116,139,0.10) 0%, transparent 70%)',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return minutes === 1 ? '1 min read' : `${minutes} min read`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ReadingViewProps {
  entry: Entry
  isOpen: boolean
  onClose: () => void
  /** Called when the user presses Edit — caller should start edit mode then close */
  onEdit: () => void
  onTogglePin: (id: number) => void
  onDelete: (id: number) => void
}

export function ReadingView({
  entry,
  isOpen,
  onClose,
  onEdit,
  onTogglePin,
  onDelete,
}: ReadingViewProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const moodDetails = getMoodDetails(entry.mood)
  const ambient = entry.mood ? MOOD_AMBIENTS[entry.mood] : undefined

  const wc = useMemo(
    () => entry.content.trim().split(/\s+/).filter(Boolean).length,
    [entry.content],
  )
  const readTime = useMemo(
    () => estimateReadingTime(entry.content),
    [entry.content],
  )

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="reading-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xl"
            style={
              ambient
                ? { background: `${ambient}, hsl(var(--background) / 0.85)` }
                : undefined
            }
          />

          {/* Reading panel */}
          <motion.div
            key="reading-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-61 flex flex-col items-center overflow-y-auto"
          >
            {/* Sticky toolbar */}
            <div className="sticky top-0 w-full z-10 flex justify-between items-center px-6 py-4 max-w-3xl mx-auto">
              {/* Meta */}
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span>{formatEntryDate(entry.createdAt)}</span>
                {moodDetails && (
                  <>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-border/30 backdrop-blur text-foreground/70">
                      <span>{moodDetails.emoji}</span>
                      {moodDetails.label}
                    </span>
                  </>
                )}
                <span className="opacity-30">•</span>
                <span>
                  {wc} words · {readTime}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <IconButton
                  tooltip={entry.isPinned ? 'Unpin' : 'Pin to top'}
                  onClick={() => onTogglePin(entry.id)}
                  className={
                    entry.isPinned
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'hover:text-amber-500 hover:bg-amber-500/10'
                  }
                >
                  <Pin
                    className={`w-4 h-4 ${entry.isPinned ? 'fill-current' : ''}`}
                  />
                </IconButton>

                <IconButton
                  tooltip="Edit entry"
                  onClick={onEdit}
                  className="hover:text-primary hover:bg-primary/10"
                >
                  <Edit3 className="w-4 h-4" />
                </IconButton>

                <IconButton
                  tooltip="Delete entry"
                  variant="danger"
                  onClick={() => {
                    onClose()
                    onDelete(entry.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>

                <div className="w-px h-4 bg-border/40 mx-1" />

                <IconButton
                  tooltip="Exit reading view (Esc)"
                  onClick={onClose}
                  className="hover:text-foreground hover:bg-muted/60"
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl mx-auto px-6 pb-24 pt-6">
              <div className="reading-view-prose">
                <MarkdownViewer
                  content={entry.content}
                  className="text-[1.0625rem] leading-[1.85] tracking-[0.008em]"
                  inline
                />
              </div>

              {entry.media.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border/20">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-4">
                    Attached
                  </p>
                  <MediaGrid media={entry.media} />
                </div>
              )}

              {/* Footer colophon */}
              <div className="mt-16 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/40 font-medium tracking-wider uppercase">
                <span>{wc} words</span>
                <span className="opacity-40">·</span>
                <span>{readTime}</span>
                {moodDetails && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>
                      {moodDetails.emoji} {moodDetails.label}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
