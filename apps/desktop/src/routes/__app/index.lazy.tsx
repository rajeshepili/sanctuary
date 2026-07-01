import { createLazyFileRoute } from '@tanstack/react-router'
import { PageSkeleton } from '#/components/layout/PageSkeleton'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Sparkles, PenLine, Shuffle, BarChart3, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from '#/components/ui/tooltip'

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '#/components/ui/empty'
import { entriesQueryOptions } from '#/features/journal/journal.options'
import { JournalEditor } from '#/features/journal/components/editor/JournalEditor'
import { useDraft } from '#/hooks/use-draft'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { computeJournalConsistency } from '#/features/journal/journal.utils'
import { formatEntryDate } from '#/utils/date'

import { PageLayout } from '#/components/layout/PageLayout'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { useEntryEditor } from '#/features/journal/hooks/useEntryEditor'

export const Route = createLazyFileRoute('/__app/')({
  component: DashboardPage,
  pendingComponent: PageSkeleton,
})

function DashboardPage() {
  const { data: entries } = useSuspenseQuery(entriesQueryOptions())
  const navigate = Route.useNavigate()

  const activeEntries = useMemo(
    () => entries.filter((e) => !e.deletedAt).slice(0, 3),
    [entries],
  )

  const journalConsistency = useMemo(
    () => computeJournalConsistency(entries),
    [entries],
  )
  const totalActive = useMemo(
    () => entries.filter((e) => !e.deletedAt).length,
    [entries],
  )

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

  const handleDismissPrompt = useCallback(() => {
    import('#/lib/session-store').then(({ sessionStore }) => {
      sessionStore.consumePendingPrompt()
    })
    setPendingPrompt(null)
  }, [])

  const handleSave = useCallback(async () => {
    const entry = await editor.save()
    if (entry) {
      clearDraft()
    }
  }, [editor, clearDraft])

  return (
    <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 mx-auto w-full">
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
                        onClick={handleDismissPrompt}
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
              mood={editor.mood}
              setMood={editor.setMood}
              onSave={handleSave}
              pendingMedia={editor.pendingMedia}
              onAddMedia={editor.addMedia}
              onRemovePending={editor.removePending}
              draftStatus={draftStatus}
              draftError={draftError}
              retryDraftSave={retryDraftSave}
              isSaving={editor.isSaving}
              isSaveDisabled={editor.isSaveDisabled}
              copyDraft={() => {
                navigator.clipboard.writeText(editor.content)
              }}
            />

            <FeatureErrorBoundary
              title="Recent Reflections"
              compact
              resetKeys={[entries]}
            >
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
                        navigate({
                          to: '/journal',
                          search: { entryId: entry.id },
                        })
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
                    <Empty className="py-12 border border-dashed border-border/40 rounded-2xl bg-background/20 px-4">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <PenLine />
                        </EmptyMedia>
                        <EmptyTitle>No reflections yet</EmptyTitle>
                        <EmptyDescription>
                          Start your first one above.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </div>
            </FeatureErrorBoundary>
          </div>

          <div className="space-y-6">
            <FeatureErrorBoundary
              title="Sanctuary Stats"
              compact
              resetKeys={[entries]}
            >
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
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>Consistency</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 opacity-50 hover:opacity-100 transition-opacity cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-center">
                          Percentage of days you journaled at least once over the last 30 days.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-bold">{journalConsistency}%</span>
                  </div>
                </div>
              </Card>
            </FeatureErrorBoundary>
          </div>
        </div>
    </PageLayout>
  )
}
