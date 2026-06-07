import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, History } from 'lucide-react'
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '#/components/ui/empty'
import type { Entry } from '#/types'
import { useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { EntryCard } from '#/features/dashboard/components/EntryCard'
import { MAX_DASHBOARD_ENTRIES } from '#/lib/constants'

interface PastEntriesListProps {
  entries: Entry[]
  onDelete: (id: number) => Promise<void>
  onUpdate: (
    id: number,
    content: string,
    addedMedia?: { file: File; base64: string }[],
    removedMediaIds?: number[],
  ) => Promise<Omit<Entry, 'media'>>
  onTogglePin: (id: number) => Promise<Omit<Entry, 'media'>>
}

export function PastEntriesList({
  entries,
  onDelete,
  onUpdate,
  onTogglePin,
}: PastEntriesListProps) {
  const handleTagClick = useCallback((_tag: string) => {
    // Tag filtering can be handled on the journal page
  }, [])

  const displayEntries = entries.slice(0, MAX_DASHBOARD_ENTRIES)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <History className="w-3.5 h-3.5" />
          <span>Recent Reflections</span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {entries.length} total
        </span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="sync">
          {displayEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onTogglePin={onTogglePin}
              onTagClick={handleTagClick}
            />
          ))}
        </AnimatePresence>

        {entries.length > MAX_DASHBOARD_ENTRIES && (
          <div className="pt-2 flex justify-center">
            <Link
              to="/journal"
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-card/60 border border-border/40 text-foreground/80 hover:text-foreground hover:bg-card/80 transition-all shadow-sm"
            >
              View all {entries.length} reflections
            </Link>
          </div>
        )}

        {entries.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Empty className="py-16 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen className="w-12 h-12 text-accent-foreground/80" />
                </EmptyMedia>
                <EmptyTitle>
                  Your private sanctuary is currently empty.
                </EmptyTitle>
                <EmptyDescription>
                  Write reflections in the card above to begin your journal.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
