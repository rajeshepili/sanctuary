import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'

import { entriesQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'

import { Hero } from '#/components/layout/Hero'
import { FocusSection } from '#/components/layout/FocusSection'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { formatEntryDate } from '#/utils/date'

export const Route = createLazyFileRoute('/__app/trash')({
  component: TrashPage,
})

function TrashPage() {
  const { data: entries } = useSuspenseQuery(entriesQueryOptions())
  const { restoreEntry, permanentDeleteEntry } = useJournalMutations()

  const deletedEntries = entries.filter((e) => !!e.deletedAt)

  return (
    <>
      <Hero
        title="Trash Bin"
        description="Recover deleted journal entries or empty the trash bin permanently."
      />

      <FocusSection>
        <FeatureErrorBoundary title="Trash Bin">
          <div className="space-y-4 max-w-4xl mx-auto">
            {deletedEntries.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border/40 rounded-3xl bg-card/20 backdrop-blur-sm">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground font-medium">Your trash is empty.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-500/80 font-medium">
                    Items in trash are automatically purged after 30 days.
                  </p>
                </div>
                {deletedEntries.map((entry) => (
                  <Card key={entry.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border/40 bg-card/60">
                    <div className="space-y-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Deleted {formatEntryDate(entry.deletedAt!)}
                      </div>
                      <p className="text-sm line-clamp-1 text-foreground/70 leading-relaxed italic">
                        "{entry.content.substring(0, 100)}..."
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreEntry.mutate(entry.id)}
                        className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => permanentDeleteEntry.mutate(entry.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Purge
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </FeatureErrorBoundary>
      </FocusSection>
    </>
  )
}
