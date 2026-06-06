import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DraftStatus } from '#/hooks/use-draft'

interface AutoSaveIndicatorProps {
  status: DraftStatus
  error?: string | null
}

export function AutoSaveIndicator({ status, error }: AutoSaveIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 text-xs font-medium"
        >
          {status === 'saving' && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-muted-foreground">Saving draft…</span>
            </div>
          )}

          {status === 'saved' && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">Draft saved</span>
            </div>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-500">
                {error || 'Draft save failed'}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
