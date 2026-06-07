import { Search, Tag } from 'lucide-react'
import { ScrollArea } from '#/components/ui/scroll-area'

interface EntryListPaneProps {
  /** Controlled search input value */
  searchQuery: string
  onSearchChange: (value: string) => void
  /** All unique tags derived from the visible entries */
  allTags: string[]
  selectedTag: string | null
  onTagToggle: (tag: string) => void
  /** Rendered entry items — caller decides the shape */
  children: React.ReactNode
  /** Slot rendered above the search bar (e.g. a count badge or action button) */
  header?: React.ReactNode
  searchPlaceholder?: string
  emptyLabel?: string
  itemCount: number
}

/**
 * Shared left-pane shell used by the Journal and Trash pages.
 * Provides search, tag filter chips, and a ScrollArea-wrapped list slot.
 */
export function EntryListPane({
  searchQuery,
  onSearchChange,
  allTags,
  selectedTag,
  onTagToggle,
  children,
  header,
  searchPlaceholder = 'Search reflections…',
}: EntryListPaneProps) {
  return (
    <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-3 border border-border/40 bg-card/40 backdrop-blur-md rounded-[1.4rem] p-4 overflow-hidden">
      {header && (
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          {header}
        </div>
      )}

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-border/40 bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mr-0.5">
            <Tag className="w-3 h-3" /> Tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-background/50 border border-border/40 text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable list slot */}
      <ScrollArea className="flex-1 -mr-2 min-h-0">
        <div className="space-y-2 pr-2">{children}</div>
      </ScrollArea>
    </div>
  )
}
