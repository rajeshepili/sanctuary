import { BookOpen, Clock, History, Edit3, Trash2, Pin, Loader2, PenLine } from 'lucide-react'
import { formatEntryDate } from '#/utils/date'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownViewer } from '#/features/journal/components/MarkdownViewer'
import { MediaGrid } from '#/features/journal/components/MediaGrid'
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '#/config/branding'
import { FocusSection } from '#/components/layout/FocusSection'
import { Hero } from '#/components/layout/Hero'
import { EntryEditForm } from '#/features/journal/components/editor/EntryEditForm'
import { EntryListPane } from '#/features/journal/components/EntryListPane'
import { EntryViewerPane } from '#/features/journal/components/EntryViewerPane'
import type { Entry } from '#/types'
import type { EntryListViewModel } from '#/features/journal/hooks/useEntryList'
import type { EntryEditorViewModel } from '#/features/journal/hooks/useEntryEditor'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { Button } from '#/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import type { DraftStatus } from '#/hooks/use-draft'

interface JournalViewProps {
  entries: Entry[]
  activeEntry?: Entry
  isCreating?: boolean
  list: EntryListViewModel
  editor: EntryEditorViewModel
  onSelect: (id: number) => void
  onCreateNew: () => void
  onCancelCreate: () => void
  onSaveNew: (id: number) => void
  onEditSave: () => void
  onTogglePin: (id: number) => void
  onDelete: (id: number) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  draftStatus?: DraftStatus
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void
}

export function JournalView({
  entries,
  activeEntry,
  isCreating,
  list,
  editor,
  onSelect,
  onCreateNew,
  onCancelCreate,
  onSaveNew,
  onEditSave,
  onTogglePin,
  onDelete,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  draftStatus,
  draftError,
  retryDraftSave,
  copyDraft,
}: JournalViewProps) {
  return (
    <>
      <Hero
        title={PAGE_TITLES.journal}
        description={PAGE_DESCRIPTIONS.journal}
      />

      <FocusSection>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-12rem)] min-h-[600px]">
          {/* LEFT PANE */}
          <FeatureErrorBoundary title="Reflection List" className="w-full lg:w-80 shrink-0">
            <EntryListPane
              searchQuery={list.searchQuery}
              onSearchChange={list.setSearchQuery}
              allTags={list.allTags}
              selectedTag={list.selectedTag}
              onTagToggle={list.toggleTag}
              itemCount={entries.length}
              searchPlaceholder="Search reflections…"
              header={
                <>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {entries.length} Reflection{entries.length !== 1 ? 's' : ''}
                  </span>
                  <Button
                    size="sm"
                    onClick={onCreateNew}
                    className="gap-1.5 h-7 px-2.5 text-xs"
                  >
                    <PenLine className="w-3 h-3" />
                    New
                  </Button>
                </>
              }
            >
              {list.filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => {
                    onSelect(entry.id)
                    editor.cancelEdit()
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
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
                    {entry.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-foreground/85 line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                  {entry.media.length > 0 && (
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">
                      {entry.media.length} photo
                      {entry.media.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}

              {hasNextPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isFetchingNextPage}
                  className="w-full text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-12"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  ) : null}
                  {isFetchingNextPage ? 'Loading...' : 'Load More Reflections'}
                </Button>
              )}

              {list.filteredEntries.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No reflections found.
                </div>
              )}
            </EntryListPane>
          </FeatureErrorBoundary>

          {/* RIGHT PANE */}
          <FeatureErrorBoundary title="Reflection Viewer" className="flex-1 min-w-0">
            <EntryViewerPane
              hasActiveEntry={!!activeEntry || !!isCreating}
              isEditing={editor.isEditing || !!isCreating}
              activeKey={
                isCreating 
                  ? 'creating'
                  : editor.isEditing
                    ? `edit-${activeEntry?.id}`
                    : `view-${activeEntry?.id}`
              }
              emptyState={
                <>
                  <BookOpen className="w-12 h-12 opacity-20" />
                  <p className="text-base font-medium mb-4">
                    Select a reflection to read
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={onCreateNew}>
                      <PenLine className="w-4 h-4 mr-2" />
                      Start Writing
                    </Button>
                  </div>
                </>
              }
            >
              {(isCreating || (activeEntry && editor.isEditing)) ? (
                <EntryEditForm
                  content={editor.content}
                  onContentChange={editor.setContent}
                  existingMedia={activeEntry?.media ?? []}
                  pendingMedia={editor.pendingMedia}
                  removedMediaIds={editor.removedMediaIds}
                  onAddMedia={editor.addMedia}
                  onRemovePending={editor.removePending}
                  onRemoveExisting={editor.removeExisting}
                  onSave={async () => {
                    const newEntry = await editor.save();
                    if (newEntry && isCreating) {
                      onSaveNew(newEntry.id)
                    } else if (newEntry && !isCreating) {
                      onEditSave()
                    }
                  }}
                  onCancel={() => {
                    editor.cancelEdit()
                    if (isCreating) {
                      onCancelCreate()
                    }
                  }}
                  isSaveDisabled={editor.isSaveDisabled}
                  entryId={activeEntry?.id}
                  draftStatus={draftStatus}
                  draftError={draftError}
                  retryDraftSave={retryDraftSave}
                  copyDraft={copyDraft}
                />
              ) : activeEntry ? (
                  <>
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        <History className="w-4 h-4" />
                        {formatEntryDate(activeEntry.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconButton
                          tooltip={activeEntry.isPinned ? 'Unpin' : 'Pin to top'}
                          onClick={() => onTogglePin(activeEntry.id)}
                          className={
                            activeEntry.isPinned
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'hover:text-amber-500 hover:bg-amber-500/10'
                          }
                        >
                          <Pin
                            className={`w-4 h-4 ${activeEntry.isPinned ? 'fill-current' : ''}`}
                          />
                        </IconButton>
                        <IconButton
                          tooltip="Edit entry"
                          onClick={editor.startEdit}
                          className="hover:text-primary hover:bg-primary/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          tooltip="Delete entry"
                          variant="danger"
                          onClick={() => onDelete(activeEntry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>

                    <MarkdownViewer
                      content={activeEntry.content}
                      onTagClick={list.toggleTag}
                      className="text-base leading-relaxed"
                    />

                    {activeEntry.media.length > 0 && (
                      <div className="pt-4 border-t border-border/20">
                        <MediaGrid media={activeEntry.media} />
                      </div>
                    )}
                  </>
                ) : null}
            </EntryViewerPane>
          </FeatureErrorBoundary>
        </div>
      </FocusSection>
    </>
  )
}
