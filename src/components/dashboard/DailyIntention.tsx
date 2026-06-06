import { useState } from 'react'
import { Card } from '#/components/ui/card'
import { Feather, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { DAILY_INTENTION_KEY } from '#/lib/constants'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocalState } from '#/hooks/use-local-state'
import { IconButton } from '#/components/ui/icon-button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { Kbd } from '#/components/ui/kbd'
import { Button } from '#/components/ui/button'

export function DailyIntention() {
  const [dailyIntention, setDailyIntention] = useLocalState(
    DAILY_INTENTION_KEY,
    '',
  )
  const [isEditingIntention, setIsEditingIntention] = useState(false)
  const [tempIntention, setTempIntention] = useState(dailyIntention)

  const updateFocus = (newValue: string) => {
    const trimmed = newValue.trim()
    if (!trimmed) {
      setDailyIntention('')
      setTempIntention('')
      toast.success('Focus cleared.')
    } else {
      setDailyIntention(trimmed)
      toast.success('Focus set.')
    }
    setIsEditingIntention(false)
  }

  const handleSaveIntention = (e: React.SubmitEvent) => {
    e.preventDefault()
    updateFocus(tempIntention)
  }

  const handleClearIntention = () => {
    updateFocus('')
  }

  return (
    <AnimatePresence mode="wait">
      {dailyIntention && !isEditingIntention ? (
        <motion.div
          key="intention-banner"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
        >
          <Card
            className="
            p-4 rounded-xl border border-primary/25 bg-primary/2 backdrop-blur-xl shadow-sm
            flex items-center justify-between gap-4 relative overflow-hidden group
          "
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Feather className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  My Focus For Today
                </div>
                <p className="text-sm font-bold italic tracking-wide text-foreground/90 mt-0.5 font-serif leading-relaxed">
                  "{dailyIntention}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTempIntention(dailyIntention)
                      setIsEditingIntention(true)
                    }}
                    className="
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      text-[10px] font-bold h-7 px-2.5 py-1
                    "
                  >
                    Revise
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit your daily focus</TooltipContent>
              </Tooltip>
              <IconButton
                tooltip="Clear focus"
                variant="danger"
                onClick={handleClearIntention}
              >
                <X className="w-4 h-4" />
              </IconButton>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="intention-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Card className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md">
            <form
              onSubmit={handleSaveIntention}
              className="flex flex-col sm:flex-row gap-3 items-center"
            >
              <div className="grow w-full space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <span>What is your focus today?</span>
                </div>
                <input
                  type="text"
                  value={tempIntention}
                  onChange={(e) => setTempIntention(e.target.value)}
                  placeholder="e.g. Focus on deep work, be present in meetings, take a screen break..."
                  className="
                    w-full px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-foreground/5 border border-border/40 focus:outline-none focus:border-primary
                    text-foreground transition-all
                  "
                  maxLength={100}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto self-end">
                <Button
                  type="submit"
                  size="sm"
                  className="min-w-max sm:w-auto font-bold"
                >
                  Set Focus
                  <Kbd className="ml-2 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
                    ↵
                  </Kbd>
                </Button>
                {dailyIntention && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsEditingIntention(false)}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
