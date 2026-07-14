import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '#/components/ui/scroll-area'

interface EntryViewerPaneProps {
  /** The right-pane content rendered when an entry is active */
  children: React.ReactNode
  /** Slot shown when no entry is selected */
  emptyState: React.ReactNode
  /** True when an entry is actively selected */
  hasActiveEntry: boolean
  /**
   * Unique key that changes when the viewed entry/mode changes — drives the
   * exit/enter animation. Should include the mode so view→edit transitions animate too.
   */
  activeKey: string | number
  /**
   * When true (edit mode), the ScrollArea wrapper is removed and padding is
   * tightened so the inline editor can fill the pane without double-scrollbars
   * or a floating card-in-card appearance.
   */
  isEditing?: boolean
}

/**
 * Shared right-pane shell used by the Journal and Trash pages.
 *
 * SCROLL NOTE: The ScrollArea is kept outside the animated motion.div so that
 * switching between entries does not reset the scroll position to zero.
 * AnimatePresence mode="wait" would unmount the scroll container itself if it
 * were the animated element. We only animate the content inside it instead.
 *
 * EDIT MODE: When isEditing is true the ScrollArea is omitted entirely — the
 * TipTap editor handles its own height/overflow, and wrapping it in another
 * scroll container causes a nested-scroll / card-in-card layout problem.
 */
export function EntryViewerPane({
  children,
  emptyState,
  hasActiveEntry,
  activeKey,
  isEditing = false,
}: EntryViewerPaneProps) {
  return (
    <div className="flex-1 border border-border/40 bg-card/40 backdrop-blur-md rounded-[1.4rem] overflow-hidden flex flex-col">
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
        ) : isEditing ? (
          // ── Edit mode: no extra scroll wrapper, editor fills the pane ──
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-h-0 p-5 lg:p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        ) : (
          // ── View mode: ScrollArea stays mounted so scroll position persists ──
          <ScrollArea className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="p-6 lg:p-8 space-y-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </AnimatePresence>
    </div>
  )
}
