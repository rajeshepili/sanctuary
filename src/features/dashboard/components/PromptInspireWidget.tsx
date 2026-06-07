import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Trash2,
  Library,
  PenLine,
} from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { promptsQueryOptions } from '#/features/prompts/prompts.options'
import { usePromptsMutations } from '#/features/prompts/prompts.mutations'
import { IconButton } from '#/components/ui/icon-button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { Kbd } from '#/components/ui/kbd'
import { Button } from '#/components/ui/button'

interface PromptInspireWidgetProps {
  onUsePrompt?: (text: string) => void
}

export function PromptInspireWidget({
  onUsePrompt,
}: PromptInspireWidgetProps = {}) {
  const { data: prompts } = useSuspenseQuery(promptsQueryOptions())
  const { addPrompt, deletePrompt } = usePromptsMutations()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [newPrompt, setNewPrompt] = useState('')

  useEffect(() => {
    if (prompts.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * prompts.length))
    }
  }, [])

  const handleAdd = async (text: string) => {
    await addPrompt(text)
    setIsAdding(false)
    setNewPrompt('')
  }

  const handleDelete = async (id: number) => {
    await deletePrompt(id)
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, prompts.length - 2)))
  }

  const cyclePrompt = () => {
    if (prompts.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % prompts.length)
  }

  return (
    <div className="mb-6 bg-card/60 border border-border/50 rounded-2xl p-4 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Inspiration</span>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/prompts"
                className="p-1 rounded-full hover:bg-foreground/5 text-muted-foreground transition-colors cursor-pointer flex items-center"
              >
                <Library className="w-3.5 h-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Prompt library</TooltipContent>
          </Tooltip>

          {!isAdding && prompts.length > 0 && (
            <IconButton
              tooltip="Next prompt"
              onClick={cyclePrompt}
              className="rounded-full p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </IconButton>
          )}

          <IconButton
            tooltip={isAdding ? 'Cancel' : 'Write your own prompt'}
            onClick={() => setIsAdding(!isAdding)}
            className="rounded-full p-1"
          >
            {isAdding ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </IconButton>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex gap-2"
          >
            <input
              autoFocus
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="E.g. What challenged you today?"
              className="flex-1 bg-background/50 border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPrompt.trim())
                  handleAdd(newPrompt.trim())
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    newPrompt.trim() && handleAdd(newPrompt.trim())
                  }
                  disabled={!newPrompt.trim()}
                >
                  Save
                  <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
                    ↵
                  </Kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save prompt</TooltipContent>
            </Tooltip>
          </motion.div>
        ) : prompts.length > 0 ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-foreground/90 font-medium text-sm group flex justify-between items-start gap-4"
          >
            <p className="leading-relaxed">"{prompts[currentIndex].text}"</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {onUsePrompt && (
                <IconButton
                  tooltip="Use this prompt"
                  onClick={() => onUsePrompt(prompts[currentIndex].text)}
                  className="hover:text-primary hover:bg-primary/10"
                >
                  <PenLine className="w-3.5 h-3.5" />
                </IconButton>
              )}
              <IconButton
                tooltip="Delete prompt"
                variant="danger"
                onClick={() => handleDelete(prompts[currentIndex].id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground italic"
          >
            Add a personal writing prompt to inspire your entries.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
