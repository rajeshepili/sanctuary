import { Trash2, Clock, RefreshCcw } from 'lucide-react'
import { formatEntryDate } from '#/utils/date'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownViewer } from '#/features/journal/components/MarkdownViewer'
import { MediaGrid } from '#/features/journal/components/MediaGrid'
import { FocusSection } from '#/components/layout/FocusSection'
import { Hero } from '#/components/layout/Hero'
import { EntryListPane } from '#/features/journal/components/EntryListPane'
import { EntryViewerPane } from '#/features/journal/components/EntryViewerPane'
import type { Entry } from '#/types'
import type { EntryListViewModel } from '#/features/journal/hooks/useEntryList'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

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
    <>
      <Hero title="Trash" description="View and manage deleted reflections." />

      <FocusSection>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-12rem)] min-h-[600px]">
          {/* LEFT PANE */}
          <FeatureErrorBoundary title="Deleted Reflections" className="w-full lg:w-80 shrink-0">
            <EntryListPane
              searchQuery={list.searchQuery}
              onSearchChange={list.setSearchQuery}
              allTags={list.allTags}
              selectedTag={list.selectedTag}
              onTagToggle={list.toggleTag}
              itemCount={entries.length}
              searchPlaceholder="Search deleted entries…"
              header={
                <span className="text-sm font-semibold text-muted-foreground">
                  {entries.length} item{entries.length !== 1 ? 's' : ''} in trash
                </span>
              }
            >
              {list.filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelect(entry.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeEntry?.id === entry.id
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

              {list.filteredEntries.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {entries.length === 0
                    ? 'Trash is empty.'
                    : 'No reflections found.'}
                </div>
              )}
            </EntryListPane>
          </FeatureErrorBoundary>

          {/* RIGHT PANE */}
          <FeatureErrorBoundary title="Reflection Preview" className="flex-1 min-w-0">
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
                      Deleted on {formatEntryDate(activeEntry.deletedAt ?? activeEntry.createdAt)}
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
          </FeatureErrorBoundary>
        </div>
      </FocusSection>
    </>
  )
}
