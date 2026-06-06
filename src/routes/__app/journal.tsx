import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { BookOpen, Clock, History, Edit3, Trash2, Pin } from 'lucide-react'
import { z } from 'zod'

import { entriesQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { formatEntryDate } from '#/utils/journal'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownViewer } from '#/components/journal/MarkdownViewer'
import { MediaGrid } from '#/components/journal/MediaGrid'
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '#/config/branding'
import { FocusSection } from '#/components/layout/FocusSection'
import { Hero } from '#/components/layout/Hero'
import { EntryEditForm } from '#/components/journal/editor/EntryEditForm'
import { EntryListPane } from '#/components/journal/EntryListPane'
import { EntryViewerPane } from '#/components/journal/EntryViewerPane'
import { useEntryListState } from '#/hooks/use-entry-list-state'
import type { EntryMedia } from '#/types'

export const Route = createFileRoute('/__app/journal')({
  validateSearch: z.object({
    entryId: z.number().optional(),
  }),
  component: JournalEntriesPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(entriesQueryOptions())
  },
})

function JournalEntriesPage() {
  const { data: entries } = useSuspenseQuery(entriesQueryOptions())
  const { updateEntry, deleteEntry, togglePin } = useJournalMutations()

  const search = Route.useSearch()

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
  } = useEntryListState(entries, search.entryId)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editPendingMedia, setEditPendingMedia] = useState<
    { file: File; base64: string }[]
  >([])
  const [editRemovedMediaIds, setEditRemovedMediaIds] = useState<number[]>([])

  // Sync deep-linked entryId from search params
  useEffect(() => {
    if (search.entryId != null) setActiveEntryId(search.entryId)
  }, [search.entryId, setActiveEntryId])

  const startEdit = () => {
    if (!activeEntry) return
    setIsEditing(true)
    setEditContent(activeEntry.content)
    setEditPendingMedia([])
    setEditRemovedMediaIds([])
  }

  const cancelEdit = () => setIsEditing(false)

  const handleSaveEdit = async () => {
    if (!activeEntry) return
    await updateEntry(
      activeEntry.id,
      editContent.trim(),
      editPendingMedia,
      editRemovedMediaIds,
    )
    setIsEditing(false)
  }

  const isSaveDisabled = activeEntry
    ? !editContent.trim() &&
      activeEntry.media.filter(
        (m: EntryMedia) => !editRemovedMediaIds.includes(m.id),
      ).length === 0 &&
      editPendingMedia.length === 0
    : true

  return (
    <>
      <Hero
        title={PAGE_TITLES.journal}
        description={PAGE_DESCRIPTIONS.journal}
      />

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
            searchPlaceholder="Search reflections…"
          >
            {filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  setActiveEntryId(entry.id)
                  setIsEditing(false)
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  activeEntryId === entry.id
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
              </button>
            ))}

            {filteredEntries.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No reflections found.
              </div>
            )}
          </EntryListPane>

          {/* RIGHT PANE */}
          <EntryViewerPane
            hasActiveEntry={!!activeEntry}
            activeKey={
              isEditing ? `edit-${activeEntry?.id}` : `view-${activeEntry?.id}`
            }
            emptyState={
              <>
                <BookOpen className="w-12 h-12 opacity-20" />
                <p className="text-base font-medium">
                  Select a reflection to read
                </p>
              </>
            }
          >
            {activeEntry &&
              (isEditing ? (
                /* Editor view — no extra ScrollArea needed, EntryViewerPane provides one */
                <EntryEditForm
                  content={editContent}
                  onContentChange={setEditContent}
                  existingMedia={activeEntry.media}
                  pendingMedia={editPendingMedia}
                  removedMediaIds={editRemovedMediaIds}
                  onAddMedia={(items) =>
                    setEditPendingMedia((prev) => [...prev, ...items])
                  }
                  onRemovePending={(idx) =>
                    setEditPendingMedia((prev) =>
                      prev.filter((_, i) => i !== idx),
                    )
                  }
                  onRemoveExisting={(id) =>
                    setEditRemovedMediaIds((prev) => [...prev, id])
                  }
                  onSave={handleSaveEdit}
                  onCancel={cancelEdit}
                  isSaveDisabled={isSaveDisabled}
                  entryId={activeEntry.id}
                />
              ) : (
                /* Reading view */
                <>
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                      <History className="w-4 h-4" />
                      {formatEntryDate(activeEntry.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconButton
                        tooltip={activeEntry.isPinned ? 'Unpin' : 'Pin to top'}
                        onClick={() => togglePin(activeEntry.id)}
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
                        onClick={startEdit}
                        className="hover:text-primary hover:bg-primary/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        tooltip="Delete entry"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Delete this reflection?')) {
                            deleteEntry(activeEntry.id)
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
                    onTagClick={toggleTag}
                    className="text-base leading-relaxed"
                  />

                  {activeEntry.media.length > 0 && (
                    <div className="pt-4 border-t border-border/20">
                      <MediaGrid media={activeEntry.media} />
                    </div>
                  )}
                </>
              ))}
          </EntryViewerPane>
        </div>
      </FocusSection>
    </>
  )
}
