import { useState, useMemo, useCallback, useDeferredValue } from 'react'
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
    for (const e of entries) {
      for (const t of parseCommaList(e.tags)) set.add(t)
    }
    return Array.from(set).sort()
  }, [entries])

  // Pre-process search term once per render rather than inside the filter loop
  const normalizedQuery = useMemo(
    () => deferredSearchQuery.trim().toLowerCase(),
    [deferredSearchQuery],
  )

  const filteredEntries = useMemo(() => {
    if (!selectedTag && !normalizedQuery) return entries

    return entries.filter((entry) => {
      // Tag filter
      if (selectedTag && !parseCommaList(entry.tags).includes(selectedTag)) {
        return false
      }

      // Full-text search across content, tags, and date
      if (normalizedQuery) {
        const dateStr = new Date(entry.createdAt)
          .toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .toLowerCase()

        const matchesContent = entry.content
          .toLowerCase()
          .includes(normalizedQuery)
        const matchesTags = !!entry.tags
          ?.toLowerCase()
          .includes(normalizedQuery)
        const matchesDate = dateStr.includes(normalizedQuery)

        if (!matchesContent && !matchesTags && !matchesDate) return false
      }

      return true
    })
  }, [entries, selectedTag, normalizedQuery])

  const toggleTag = useCallback(
    (tag: string) => setSelectedTag((prev) => (prev === tag ? null : tag)),
    [],
  )

  return {
    searchQuery,
    setSearchQuery,
    selectedTag,
    toggleTag,
    allTags,
    filteredEntries,
  }
}
