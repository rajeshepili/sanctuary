import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Trash2, Clock, RefreshCcw } from 'lucide-react'

import { trashQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { formatEntryDate } from '#/utils/journal'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownViewer } from '#/components/journal/MarkdownViewer'
import { MediaGrid } from '#/components/journal/MediaGrid'
import { FocusSection } from '#/components/layout/FocusSection'
import { Hero } from '#/components/layout/Hero'
import { EntryListPane } from '#/components/journal/EntryListPane'
import { EntryViewerPane } from '#/components/journal/EntryViewerPane'
import { useEntryListState } from '#/hooks/use-entry-list-state'

export const Route = createFileRoute('/__app/trash')({
  component: TrashEntriesPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(trashQueryOptions())
  },
})

function TrashEntriesPage() {
  const { data: entries } = useSuspenseQuery(trashQueryOptions())
  const { restoreEntry, permanentDeleteEntry } = useJournalMutations()

  const {
    searchQuery,
    setSearchQuery,
    selectedTag,
    toggleTag,
    allTags,
    filteredEntries,
    activeEntryId,
    setActiveEntryId,
    activeEntry,
  } = useEntryListState(entries)

  return (
    <>
      <Hero title="Trash" description="View and manage deleted reflections." />

      <FocusSection>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-12rem)] min-h-[600px]">
          {/* LEFT PANE */}
          <EntryListPane
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allTags={allTags}
            selectedTag={selectedTag}
            onTagToggle={toggleTag}
            itemCount={entries.length}
            searchPlaceholder="Search deleted entries…"
            header={
              <span className="text-sm font-semibold text-muted-foreground">
                {entries.length} item{entries.length !== 1 ? 's' : ''} in trash
              </span>
            }
          >
            {filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setActiveEntryId(entry.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeEntryId === entry.id
                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                    : 'border-border/30 bg-background/30 hover:bg-background/60 hover:border-border/60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  {formatEntryDate(entry.createdAt)}
                </div>
                <div className="text-sm text-foreground/90 line-clamp-2 leading-relaxed">
                  {entry.content}
                </div>
              </button>
            ))}

            {filteredEntries.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {entries.length === 0
                  ? 'Trash is empty.'
                  : 'No reflections found.'}
              </div>
            )}
          </EntryListPane>

          {/* RIGHT PANE */}
          <EntryViewerPane
            hasActiveEntry={!!activeEntry}
            activeKey={`trash-${activeEntry?.id}`}
            emptyState={
              <>
                <Trash2 className="w-12 h-12 opacity-20" />
                <p className="text-base font-medium">
                  Select a reflection to view
                </p>
              </>
            }
          >
            {activeEntry && (
              <>
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                    <Trash2 className="w-4 h-4" />
                    Deleted on {formatEntryDate(activeEntry.updatedAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton
                      tooltip="Restore reflection"
                      onClick={() => {
                        restoreEntry(activeEntry.id)
                        setActiveEntryId(null)
                      }}
                      className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      tooltip="Delete permanently"
                      variant="danger"
                      onClick={() => {
                        if (
                          confirm(
                            'Are you sure you want to permanently delete this reflection? This cannot be undone.',
                          )
                        ) {
                          permanentDeleteEntry(activeEntry.id)
                          setActiveEntryId(null)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>

                <MarkdownViewer
                  content={activeEntry.content}
                  className="text-base leading-relaxed opacity-75"
                />

                {activeEntry.media.length > 0 && (
                  <div className="pt-4 border-t border-border/20 opacity-75">
                    <MediaGrid media={activeEntry.media} />
                  </div>
                )}
              </>
            )}
          </EntryViewerPane>
        </div>
      </FocusSection>
    </>
  )
}
