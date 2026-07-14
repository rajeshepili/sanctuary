import { Trash2, Clock, RefreshCcw } from 'lucide-react'
import { formatEntryDate } from '#/utils/date'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownViewer } from '#/features/journal/components/MarkdownViewer'
import { MediaGrid } from '#/features/journal/components/MediaGrid'
import { PageLayout } from '#/components/layout/PageLayout'
import { EntryListPane } from '#/features/journal/components/EntryListPane'
import { EntryViewerPane } from '#/features/journal/components/EntryViewerPane'
import { getMoodDetails } from '#/features/journal/journal.moods'
import type { Entry } from '#/types'
import type { EntryListViewModel } from '#/features/journal/hooks/useEntryList'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '#/components/ui/empty'

interface TrashViewProps {
  entries: Entry[]
  activeEntry?: Entry
  list: EntryListViewModel
  onSelect: (id: number) => void
  onRestore: (id: number) => void
  onDeletePermanently: (id: number) => void
}

export function TrashView({
  entries,
  activeEntry,
  list,
  onSelect,
  onRestore,
  onDeletePermanently,
}: TrashViewProps) {
  return (
    <PageLayout>
      <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100dvh-14rem)]">
        {/* LEFT PANE */}
        <FeatureErrorBoundary
          title="Deleted Reflections"
          className="w-full lg:w-80 shrink-0"
        >
          <EntryListPane
            searchQuery={list.searchQuery}
            onSearchChange={list.setSearchQuery}
            allTags={list.allTags}
            selectedTag={list.selectedTag}
            onTagToggle={list.toggleTag}
            itemCount={entries.length}
            searchPlaceholder="Search deleted entries…"
            header={
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {entries.length} item{entries.length !== 1 ? 's' : ''} in trash
              </span>
            }
          >
            {list.filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  activeEntry?.id === entry.id
                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                    : 'border-border/30 bg-background/30 hover:bg-background/60 hover:border-border/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <Clock className="w-3 h-3" />
                    {formatEntryDate(entry.createdAt)}
                  </div>
                  {entry.mood &&
                    (() => {
                      const md = getMoodDetails(entry.mood)
                      return md ? (
                        <span
                          title={md.label}
                          className="text-[11px] opacity-60"
                        >
                          {md.emoji}
                        </span>
                      ) : null
                    })()}
                </div>
                <div className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                  {entry.content}
                </div>
              </button>
            ))}

            {list.filteredEntries.length === 0 && (
              <Empty className="py-12 border-none px-4">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Trash2 />
                  </EmptyMedia>
                  <EmptyTitle>
                    {entries.length === 0
                      ? 'Trash is empty'
                      : 'No reflections found'}
                  </EmptyTitle>
                </EmptyHeader>
              </Empty>
            )}
          </EntryListPane>
        </FeatureErrorBoundary>

        {/* RIGHT PANE */}
        <FeatureErrorBoundary
          title="Reflection Preview"
          className="flex-1 flex flex-col min-w-0"
        >
          <EntryViewerPane
            hasActiveEntry={!!activeEntry}
            activeKey={`trash-${activeEntry?.id}`}
            emptyState={
              <Empty className="border-none bg-transparent">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Trash2 />
                  </EmptyMedia>
                  <EmptyTitle>Nothing selected</EmptyTitle>
                  <EmptyDescription>
                    Select a deleted reflection to preview or restore it.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
          >
            {activeEntry && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                    <Trash2 className="w-4 h-4" />
                    Deleted{' '}
                    {formatEntryDate(
                      activeEntry.deletedAt ?? activeEntry.createdAt,
                    )}
                    {activeEntry.mood &&
                      (() => {
                        const md = getMoodDetails(activeEntry.mood)
                        return md ? (
                          <>
                            <span className="mx-1.5 opacity-30">•</span>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-border/40 text-foreground/60 lowercase text-xs">
                              <span>{md.emoji}</span>
                              {md.label}
                            </span>
                          </>
                        ) : null
                      })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton
                      tooltip="Restore reflection"
                      onClick={() => onRestore(activeEntry.id)}
                      className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      tooltip="Delete permanently"
                      variant="danger"
                      onClick={() => onDeletePermanently(activeEntry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>

                {/* Content — slightly faded to signal deleted state */}
                <div className="opacity-75">
                  <MarkdownViewer
                    content={activeEntry.content}
                    className="text-base leading-relaxed"
                  />
                </div>

                {activeEntry.media.length > 0 && (
                  <div className="pt-4 border-t border-border/20 opacity-75">
                    <MediaGrid media={activeEntry.media} />
                  </div>
                )}
              </>
            )}
          </EntryViewerPane>
        </FeatureErrorBoundary>
      </div>
    </PageLayout>
  )
}
