import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toastAsync } from '#/lib/toast-async'
import { withOptimistic } from '#/lib/with-optimistic'
import { toast } from 'sonner'
import { journalCache } from './journal.cache'
import {
  createEntry as createEntryApi,
  updateEntry as updateEntryApi,
  deleteEntry as deleteEntryApi,
  togglePin as togglePinApi,
  undeleteEntry as undeleteEntryApi,
  permanentDeleteEntry as permanentDeleteEntryApi,
} from './journal.api'
import { parseError } from '#/lib/error-parser'

export function useJournalMutations() {
  const queryClient = useQueryClient()

  const createEntry = useCallback(
    (value: string, apiMedia: { base64Data: string }[]) =>
      toastAsync(
        async () => {
          const entry = await createEntryApi({
            data: {
              content: value.trim(),
              media: apiMedia,
            },
          })
          journalCache.insert(queryClient, entry)
          return entry
        },
        {
          loading: 'Recording thought…',
          success: 'Saved to sanctuary.',
        },
      ),
    [queryClient],
  )

  const updateEntry = useCallback(
    (
      id: number,
      content: string,
      apiMedia: { base64Data: string }[] = [],
      removedMediaIds: number[] = [],
    ) => {
      const trimmed = content.trim()
      return toastAsync(
        () =>
          withOptimistic(
            {
              snapshot: (qc) => journalCache.snapshot(qc),
              apply: (qc) =>
                journalCache.update(qc, id, {
                  content: trimmed,
                  updatedAt: new Date(),
                  /**
                   * Optimistic update applied to text content and timestamps only.
                   * Complex media mutations (adds/removes) defer to the server response.
                   */
                }),
              execute: () =>
                updateEntryApi({
                  data: {
                    id,
                    content: trimmed,
                    addedMedia: apiMedia,
                    removedMediaIds,
                  },
                }),
              restore: (qc, snap) => journalCache.restore(qc, snap),
            },
            queryClient,
          ).then((updated) => {
            journalCache.update(queryClient, id, updated)
            return updated
          }),
        {
          loading: 'Updating…',
          success: 'Entry updated.',
        },
      )
    },
    [queryClient],
  )

  const togglePin = useCallback(
    (id: number) =>
      toastAsync(
        () =>
          withOptimistic(
            {
              snapshot: (qc) => journalCache.snapshot(qc),
              apply: (qc) => journalCache.togglePin(qc, id),
              execute: () => togglePinApi({ data: { id } }),
              restore: (qc, snap) => journalCache.restore(qc, snap),
            },
            queryClient,
          ),
        {
          loading: 'Updating pin…',
          success: 'Pin toggled.',
        },
      ),
    [queryClient],
  )

  const deleteEntry = useCallback(
    (id: number) => {
      const snapshot = journalCache.snapshot(queryClient)
      const entry = snapshot.flat?.find((e) => e.id === id)

      const promise = deleteEntryApi({ data: { id } }).then(() => {
        journalCache.remove(queryClient, id)
        if (entry) journalCache.moveToTrash(queryClient, entry)
      })

      toast.promise(promise, {
        loading: 'Deleting…',
        success: 'Entry deleted.',
        error: (err: unknown) => {
          const parsed = parseError(err)
          return parsed.message
        },
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await undeleteEntryApi({ data: { id } })
              journalCache.restoreFromTrash(queryClient, id)
              toast.success('Restored.', { duration: 2000 })
            } catch {
              toast.error('Failed to restore.', { duration: 2000 })
            }
          },
        },
        duration: 10000,
      })

      return promise
    },
    [queryClient],
  )

  const restoreEntry = useCallback(
    (id: number) => {
      const promise = undeleteEntryApi({ data: { id } }).then(() => {
        journalCache.restoreFromTrash(queryClient, id)
      })

      toast.promise(promise, {
        loading: 'Restoring…',
        success: 'Entry restored.',
        error: (err: unknown) => {
          const parsed = parseError(err)
          return parsed.message
        },
      })

      return promise
    },
    [queryClient],
  )

  const permanentDeleteEntry = useCallback(
    (id: number) => {
      const promise = permanentDeleteEntryApi({ data: { id } }).then(() => {
        journalCache.removeFromTrash(queryClient, id)
      })

      toast.promise(promise, {
        loading: 'Deleting…',
        success: 'Permanently deleted.',
        error: (err: unknown) => {
          const parsed = parseError(err)
          return parsed.message
        },
      })

      return promise
    },
    [queryClient],
  )

  return {
    createEntry,
    updateEntry,
    togglePin,
    deleteEntry,
    restoreEntry,
    permanentDeleteEntry,
  }
}
