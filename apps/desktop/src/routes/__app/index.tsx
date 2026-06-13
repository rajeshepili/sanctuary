import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Sparkles, PenLine, Shuffle, BarChart3 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { entriesQueryOptions } from '#/features/journal/journal.options'
import { FocusSection } from '#/components/layout/FocusSection'
import { Hero } from '#/components/layout/Hero'
import { JournalEditor } from '#/features/journal/components/editor/JournalEditor'
import { useDraft } from '#/hooks/use-draft'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { computeJournalConsistency } from '#/utils/journal'
import { formatEntryDate } from '#/utils/date'

import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '#/config/branding'
import { useEntryEditor } from '#/features/journal/hooks/useEntryEditor'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

export const Route = createFileRoute('/__app/')({
  component: DashboardPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(entriesQueryOptions())
  },
})

function DashboardPage() {
  const { data: entries } = useSuspenseQuery(entriesQueryOptions())
  const navigate = useNavigate()


  const activeEntries = useMemo(
    () => entries.filter((e) => !e.deletedAt).slice(0, 3),
    [entries],
  )

  const journalConsistency = useMemo(() => computeJournalConsistency(entries), [entries])
  const totalActive = useMemo(() => entries.filter((e) => !e.deletedAt).length, [entries])

  const editor = useEntryEditor()
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)

  const {
    status: draftStatus,
    error: draftError,
    clearDraft,
    retrySave: retryDraftSave,
  } = useDraft({
    key: 'new_entry',
    value: editor.content,
    onRestore: (val) => editor.setContent(val),
  })

  useEffect(() => {
    import('#/lib/session-store').then(({ sessionStore }) => {
      const prompt = sessionStore.getPendingPrompt()
      if (prompt) {
        setPendingPrompt(prompt)
      }
    })
  }, [])

  const handleUsePrompt = useCallback(() => {
    if (pendingPrompt) {
      editor.setContent((prev) =>
        prev.trim() ? `${prev}\n\n${pendingPrompt}` : pendingPrompt,
      )
      import('#/lib/session-store').then(({ sessionStore }) => {
        sessionStore.consumePendingPrompt()
      })
      setPendingPrompt(null)
    }
  }, [pendingPrompt, editor])

  const handleSave = async () => {
    const entry = await editor.save()
    if (entry) {
      clearDraft()
      navigate({ to: '/journal', search: { entryId: entry.id } })
    }
  }

  return (
    <>
      <Hero
        title={PAGE_TITLES.home}
        description={PAGE_DESCRIPTIONS.home}
      />

      <FocusSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {pendingPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="p-4 border-primary/30 bg-primary/5 mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-sm italic text-foreground/90">
                        "{pendingPrompt}"
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUsePrompt}>
                        Use Prompt
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          import('#/lib/session-store').then(
                            ({ sessionStore }) => {
                              sessionStore.consumePendingPrompt()
                            },
                          )
                          setPendingPrompt(null)
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <JournalEditor
              value={editor.content}
              setValue={editor.setContent}
              onSave={handleSave}
              pendingMedia={editor.pendingMedia}
              onAddMedia={editor.addMedia}
              onRemovePending={editor.removePending}
              draftStatus={draftStatus}
              draftError={draftError}
              retryDraftSave={retryDraftSave}
              copyDraft={() => {
                navigator.clipboard.writeText(editor.content)
              }}
            />

            <FeatureErrorBoundary title="Recent Reflections" compact resetKeys={[entries]}>
              <div className="pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    Recent Reflections
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/journal' })}
                  >
                    View all
                  </Button>
                </div>

                <div className="grid gap-3">
                  {activeEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="p-4 hover:bg-foreground/5 cursor-pointer transition-colors border-border/40"
                      onClick={() =>
                        navigate({ to: '/journal', search: { entryId: entry.id } })
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                          <Shuffle className="w-3 h-3" />
                          {formatEntryDate(entry.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2 text-foreground/80 leading-relaxed">
                        {entry.content}
                      </p>
                    </Card>
                  ))}

                  {activeEntries.length === 0 && (
                    <div className="py-12 text-center border border-dashed border-border/40 rounded-2xl bg-background/20">
                      <PenLine className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground">
                        No reflections yet. Start your first one above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </FeatureErrorBoundary>
          </div>

          <div className="space-y-6">
            <FeatureErrorBoundary title="Sanctuary Stats" compact resetKeys={[entries]}>
              <Card className="p-6 border-border/60 bg-card/50 backdrop-blur-xl rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Your Sanctuary
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Reflections
                    </span>
                    <span className="font-bold">{totalActive}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Consistency
                    </span>
                    <span className="font-bold">
                      {journalConsistency}%
                    </span>
                  </div>
                </div>
              </Card>
            </FeatureErrorBoundary>
          </div>
        </div>
      </FocusSection>
    </>
  )
}
