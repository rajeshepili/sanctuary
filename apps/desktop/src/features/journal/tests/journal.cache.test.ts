import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { journalCache } from '../journal.cache'
import { journalKeys } from '../journal.keys'
import type { Entry } from '#/types'

describe('journalCache', () => {
  let queryClient: QueryClient

  const mockEntries: Entry[] = [
    {
      id: 1,
      content: 'Pinned entry',
      isPinned: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      deletedAt: null,
      tags: null,
      media: [],
    },
    {
      id: 2,
      content: 'Newer unpinned',
      isPinned: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      deletedAt: null,
      tags: null,
      media: [],
    },
    {
      id: 3,
      content: 'Older unpinned',
      isPinned: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      tags: null,
      media: [],
    },
  ]

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.spyOn(queryClient, 'setQueryData')
    vi.spyOn(queryClient, 'getQueryData').mockImplementation((key: any) => {
      if (JSON.stringify(key) === JSON.stringify(journalKeys.entries)) {
        return mockEntries
      }
      if (key.includes('infinite')) {
        return {
          pages: [{ items: mockEntries, nextCursor: null }],
          pageParams: [undefined],
        }
      }
      return undefined
    })
  })

  it('insert() prepends entry to flat and infinite cache', () => {
    const newEntry: Entry = {
      id: 4,
      content: 'Very new',
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      tags: null,
      media: [],
    }

    journalCache.insert(queryClient, newEntry)

    // Verify flat list update
    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      journalKeys.entries,
      expect.any(Function),
    )

    // Verify infinite pages update
    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      [...journalKeys.entries, 'infinite'],
      expect.any(Function),
    )
  })

  it('togglePin() re-sorts entries correctly (pinned first, then by date)', () => {
    // We need to test the logic inside the setQueryData updater
    let capturedFlatUpdater: any
    vi.spyOn(queryClient, 'setQueryData').mockImplementation((key: any, updater: any) => {
      if (JSON.stringify(key) === JSON.stringify(journalKeys.entries)) {
        capturedFlatUpdater = updater
      }
      return undefined
    })

    journalCache.togglePin(queryClient, 2) // Pin the newer unpinned entry (id: 2)

    const updated = capturedFlatUpdater(mockEntries)
    
    expect(updated[0].id).toBe(2) // Newer pinned
    expect(updated[1].id).toBe(1) // Older pinned
    expect(updated[2].id).toBe(3) // Unpinned
    expect(updated[0].isPinned).toBe(true)
  })

  it('remove() filters entry from cache', () => {
    let capturedFlatUpdater: any
    vi.spyOn(queryClient, 'setQueryData').mockImplementation((key: any, updater: any) => {
      if (JSON.stringify(key) === JSON.stringify(journalKeys.entries)) {
        capturedFlatUpdater = updater
      }
      return undefined
    })

    journalCache.remove(queryClient, 1)

    const updated = capturedFlatUpdater(mockEntries)
    expect(updated.find((e: Entry) => e.id === 1)).toBeUndefined()
    expect(updated).toHaveLength(2)
  })

  it('restoreFromTrash() moves entry from trash back to active', () => {
    const trashedEntry: Entry = { ...mockEntries[0], deletedAt: new Date() }
    vi.spyOn(queryClient, 'getQueryData').mockImplementation((key: any) => {
      if (JSON.stringify(key) === JSON.stringify(journalKeys.trash)) {
        return [trashedEntry]
      }
      return undefined
    })

    const insertSpy = vi.spyOn(journalCache, 'insert')
    const removeTrashSpy = vi.spyOn(journalCache, 'removeFromTrash')

    journalCache.restoreFromTrash(queryClient, trashedEntry.id)

    expect(insertSpy).toHaveBeenCalledWith(queryClient, {
      ...trashedEntry,
      deletedAt: null,
    })
    expect(removeTrashSpy).toHaveBeenCalledWith(queryClient, trashedEntry.id)
  })
})
