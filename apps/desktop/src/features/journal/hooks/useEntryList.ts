import { useState, useMemo, useDeferredValue } from 'react'
import { parseCommaList } from '#/utils/string'
import type { Entry } from '#/types'

export interface EntryListViewModel {
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedTag: string | null
  toggleTag: (tag: string) => void
  allTags: string[]
  filteredEntries: Entry[]
}

/**
 * Shared state logic for any paginated/searchable list of journal entries.
 * Used by the Journal and Trash pages to avoid duplicating filter logic.
 */
export function useEntryList(entries: Entry[]): EntryListViewModel {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => parseCommaList(e.tags).forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [entries])

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedTag && !parseCommaList(entry.tags).includes(selectedTag))
        return false

      if (deferredSearchQuery.trim()) {
        const q = deferredSearchQuery.toLowerCase().trim()
        const dateStr = new Date(entry.createdAt)
          .toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .toLowerCase()
        if (
          !entry.content.toLowerCase().includes(q) &&
          !entry.tags?.toLowerCase().includes(q) &&
          !dateStr.includes(q)
        )
          return false
      }

      return true
    })
  }, [entries, selectedTag, deferredSearchQuery])


  const toggleTag = (tag: string) =>
    setSelectedTag((prev) => (prev === tag ? null : tag))

  return {
    searchQuery,
    setSearchQuery,
    selectedTag,
    toggleTag,
    allTags,
    filteredEntries,
  }
}