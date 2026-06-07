import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '#/components/ui/scroll-area'

interface EntryViewerPaneProps {
  /** The right-pane content — rendered inside a ScrollArea when an entry is active */
  children: React.ReactNode
  /**
   * Slot shown when no entry is selected.
   * Should contain an icon + short prompt text.
   */
  emptyState: React.ReactNode
  /** True when an entry is actively selected */
  hasActiveEntry: boolean
  /** Unique key that changes when the viewed entry changes — drives exit/enter animation */
  activeKey: string | number
}

/**
 * Shared right-pane shell used by the Journal and Trash pages.
 * Handles the AnimatePresence wrapper, ScrollArea, and the empty state.
 */
export function EntryViewerPane({
  children,
  emptyState,
  hasActiveEntry,
  activeKey,
}: EntryViewerPaneProps) {
  return (
    <div className="flex-1 border border-border/40 bg-card/40 backdrop-blur-md rounded-[1.4rem] overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasActiveEntry ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground p-8"
          >
            {emptyState}
          </motion.div>
        ) : (
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="h-full"
          >
            <ScrollArea className="h-full">
              <div className="p-6 lg:p-8 space-y-8">{children}</div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
