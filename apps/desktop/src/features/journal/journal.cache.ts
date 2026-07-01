import type { QueryClient, InfiniteData } from '@tanstack/react-query'
import type { Entry } from '#/types'
import { journalKeys } from './journal.keys'

interface InfiniteEntriesData {
  items: Entry[]
  nextCursor: number | null
}

/**
 * Low-level cache operations for journal entries.
 * Used by mutations for optimistic updates and rollbacks.
 */
export const journalCache = {
  /** Snapshot the current list for rollback */
  snapshot(queryClient: QueryClient): {
    flat?: Entry[]
    infinite?: InfiniteData<InfiniteEntriesData>
  } {
    return {
      flat: queryClient.getQueryData<Entry[]>(journalKeys.entries),
      infinite: queryClient.getQueryData<InfiniteData<InfiniteEntriesData>>([
        ...journalKeys.entries,
        'infinite',
      ]),
    }
  },

  /** Restore a previously snapshotted list */
  restore(
    queryClient: QueryClient,
    snapshot:
      | {
          flat?: Entry[]
          infinite?: InfiniteData<InfiniteEntriesData>
        }
      | undefined,
  ) {
    if (!snapshot) return
    queryClient.setQueryData(journalKeys.entries, snapshot.flat)
    queryClient.setQueryData(
      [...journalKeys.entries, 'infinite'],
      snapshot.infinite,
    )
  },

  /** Helper to update both flat and infinite caches DRYly */
  _updateCaches(
    queryClient: QueryClient,
    flatUpdater: (old: Entry[] | undefined) => Entry[] | undefined,
    infiniteUpdater: (pages: InfiniteEntriesData[]) => InfiniteEntriesData[],
  ) {
    queryClient.setQueryData<Entry[]>(journalKeys.entries, flatUpdater)
    queryClient.setQueryData<InfiniteData<InfiniteEntriesData>>(
      [...journalKeys.entries, 'infinite'],
      (old) => {
        if (!old) return old
        return { ...old, pages: infiniteUpdater(old.pages) }
      },
    )
  },

  /** Prepend a new entry to the cached list */
  insert(queryClient: QueryClient, entry: Entry) {
    this._updateCaches(
      queryClient,
      (old) => (old ? [entry, ...old] : [entry]),
      (pages) =>
        pages.map((page, i) =>
          i === 0 ? { ...page, items: [entry, ...page.items] } : page,
        ),
    )
  },

  /** Remove an entry from the cached list by id */
  remove(queryClient: QueryClient, id: number) {
    this._updateCaches(
      queryClient,
      (old) => old?.filter((e) => e.id !== id),
      (pages) =>
        pages.map((page) => ({
          ...page,
          items: page.items.filter((e) => e.id !== id),
        })),
    )
  },

  /** Patch specific fields on a cached entry */
  patch(queryClient: QueryClient, id: number, patch: Partial<Entry>) {
    this._updateCaches(
      queryClient,
      (old) => old?.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      (pages) =>
        pages.map((page) => ({
          ...page,
          items: page.items.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
    )
  },

  /** Toggle the isPinned flag and re-sort (pinned first) */
  togglePin(queryClient: QueryClient, id: number) {
    const sortFn = (a: Entry, b: Entry) => {
      if (a.isPinned !== b.isPinned)
        return Number(b.isPinned) - Number(a.isPinned)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    this._updateCaches(
      queryClient,
      (old) => {
        if (!old) return old
        const updated = old.map((e) =>
          e.id === id ? { ...e, isPinned: !e.isPinned } : e,
        )
        return [...updated].sort(sortFn)
      },
      (pages) =>
        pages.map((page) => ({
          ...page,
          items: page.items
            .map((e) => (e.id === id ? { ...e, isPinned: !e.isPinned } : e))
            .sort(sortFn),
        })),
    )
  },

  /** Optimistically move an entry to the trash cache on soft-delete */
  moveToTrash(queryClient: QueryClient, entry: Entry) {
    const trashed: Entry = { ...entry, deletedAt: new Date() }
    queryClient.setQueryData<Entry[]>(journalKeys.trash, (old) =>
      old ? [trashed, ...old] : [trashed],
    )
  },

  /** Remove an entry from the trash cache (on restore or permanent delete) */
  removeFromTrash(queryClient: QueryClient, id: number) {
    queryClient.setQueryData<Entry[]>(journalKeys.trash, (old) =>
      old?.filter((e) => e.id !== id),
    )
  },

  /** Move a trashed entry back into the live entries cache on restore */
  restoreFromTrash(queryClient: QueryClient, id: number) {
    const trash = queryClient.getQueryData<Entry[]>(journalKeys.trash)
    const restored = trash?.find((e) => e.id === id)
    if (restored) {
      const live: Entry = { ...restored, deletedAt: null }
      this.insert(queryClient, live)
      this.removeFromTrash(queryClient, id)
    }
  },

  /** Invalidate all journal queries (entries + trash) to force a fresh fetch */
  invalidateAll(queryClient: QueryClient) {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: journalKeys.entries }),
      queryClient.invalidateQueries({ queryKey: journalKeys.trash }),
    ])
  },
}
