import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Fingerprint } from 'lucide-react'

interface IdentityViewerPaneProps {
  /** Content shown when a habit is selected or 'new' mode is active */
  children: React.ReactNode
  /** True when something should be shown (habit selected OR creating new) */
  hasContent: boolean
  /** Key that drives the animation transition */
  activeKey: string | number
}

export function IdentityViewerPane({
  children,
  hasContent,
  activeKey,
}: IdentityViewerPaneProps) {
  return (
    <div className="flex-1 border border-border/40 bg-card/40 backdrop-blur-md rounded-[1.4rem] overflow-hidden min-w-0">
      <AnimatePresence mode="wait">
        {!hasContent ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground p-8"
          >
            <Fingerprint className="w-12 h-12 opacity-20" />
            <p className="text-base font-medium">
              Select an identity to view it
            </p>
            <p className="text-sm opacity-60 max-w-xs">
              Or press "New Identity" to begin casting votes for who you wish to become.
            </p>
          </motion.div>
        ) : (
          // ScrollArea is kept outside the animated key so it stays mounted when
          // switching between identities. Only the inner content animates,
          // preventing scroll position from resetting on every selection.
          <ScrollArea className="h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ 
                  type: "spring",
                  damping: 18,
                  stiffness: 120,
                  mass: 0.5
                }}
                className="p-6 lg:p-8 space-y-8"
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
