import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Sparkles, Trash2, Shuffle, PenLine } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { promptsQueryOptions } from '#/features/prompts/prompts.options'
import { usePromptsMutations } from '#/features/prompts/prompts.mutations'

import { Hero } from '#/components/layout/Hero'
import { FocusSection } from '#/components/layout/FocusSection'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '#/config/branding'
import { IconButton } from '#/components/ui/icon-button'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/__app/prompts')({
  component: PromptsPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(promptsQueryOptions())
  },
})

function PromptsPage() {
  const { data: prompts } = useSuspenseQuery(promptsQueryOptions())
  const { addPrompt, deletePrompt } = usePromptsMutations()
  const navigate = useNavigate()

  const [newText, setNewText] = useState('')
  const [featuredId, setFeaturedId] = useState<number | null>(null)

  const handleAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newText.trim()) return
      await addPrompt(newText.trim())
      setNewText('')
    },
    [newText, addPrompt],
  )

  const handleShuffle = () => {
    if (prompts.length === 0) return
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    setFeaturedId(randomPrompt.id)
  }

  const featuredPrompt = prompts.find((p) => p.id === featuredId) || prompts[0]

  const handleWriteWithPrompt = () => {
    import('#/lib/session-store').then(({ sessionStore }) => {
      sessionStore.setPendingPrompt(featuredPrompt.text)
      navigate({ to: '/' })
    })
  }

  return (
    <>
      <Hero
        title={PAGE_TITLES.prompts}
        description={PAGE_DESCRIPTIONS.prompts}
      />

      <FocusSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <FeatureErrorBoundary title="Add Prompt" compact>
              {/* Add form */}
              <form onSubmit={handleAdd} className="flex gap-3">
                <Input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Write a prompt to inspire your journaling…"
                  className="flex-1 bg-background/50 h-12 border-border/60"
                />
                <Button type="submit" disabled={!newText.trim()} className="px-6 h-12">
                  Add Prompt
                </Button>
              </form>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary title="Prompt Library">
              {/* Prompt grid */}
              <AnimatePresence mode="popLayout">
                {prompts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-card/40 backdrop-blur-md"
                  >
                    <Sparkles className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50 animate-pulse" />
                    <p className="text-base text-muted-foreground font-semibold">
                      No prompts yet.
                    </p>
                    <p className="text-sm text-muted-foreground/80 mt-1">
                      Add your first writing prompt above.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {prompts.map((prompt, i) => (
                      <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Card
                          className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                            featuredPrompt?.id === prompt.id
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-border/50 bg-card/70 hover:border-primary/30 hover:bg-card/90'
                          }`}
                          onClick={() => setFeaturedId(prompt.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Sparkles
                              className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                                featuredPrompt?.id === prompt.id
                                  ? 'text-primary'
                                  : 'text-muted-foreground/50 group-hover:text-primary/60'
                              }`}
                            />
                            <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                              {prompt.text}
                            </p>
                          </div>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePrompt(prompt.id)
                            }}
                            tooltip="Remove prompt"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </FeatureErrorBoundary>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <FeatureErrorBoundary title="Featured Prompt">
              <Card className="p-6 rounded-2xl border border-border bg-card backdrop-blur-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span>Featured Prompt</span>
                  </div>
                  {prompts.length > 1 && (
                    <IconButton
                      onClick={handleShuffle}
                      tooltip="Shuffle prompt"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {prompts.length > 0 && featuredPrompt && (
                    <motion.blockquote
                      key={featuredPrompt.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-base italic font-serif text-foreground/90 leading-relaxed border-l-2 border-primary/40 pl-4"
                    >
                      {featuredPrompt.text}
                    </motion.blockquote>
                  )}
                  {prompts.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Add a prompt to see it featured here.
                    </p>
                  )}
                </AnimatePresence>

                {prompts.length > 0 && featuredPrompt && (
                  <div className="pt-2">
                    <p className="text-[11px] text-muted-foreground/60 mb-3">
                      Click any prompt to feature it here, or shuffle for a random
                      one.
                    </p>
                    <Button
                      onClick={handleWriteWithPrompt}
                      className="w-full font-bold flex items-center justify-center gap-2"
                    >
                      <PenLine className="w-4 h-4" />
                      Write with this prompt
                    </Button>
                  </div>
                )}
              </Card>
            </FeatureErrorBoundary>

            {/* Stats card */}
            {prompts.length > 0 && (
              <FeatureErrorBoundary title="Prompt Stats" compact>
                <Card className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Library Stats
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total prompts</span>
                      <span className="font-bold text-foreground">
                        {prompts.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg length</span>
                      <span className="font-bold text-foreground">
                        {Math.round(
                          prompts.reduce(
                            (acc, p) => acc + p.text.split(' ').length,
                            0,
                          ) / prompts.length,
                        )}{' '}
                        words
                      </span>
                    </div>
                  </div>
                </Card>
              </FeatureErrorBoundary>
            )}
          </div>
        </div>
      </FocusSection>
    </>
  )
}

