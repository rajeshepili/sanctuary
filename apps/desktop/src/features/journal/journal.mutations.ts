import { useMutation, useQueryClient } from '@tanstack/react-query'

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

  const createEntry = useMutation({
    mutationFn: async ({ value, apiMedia }: { value: string; apiMedia: { base64Data: string }[] }) => {
      const promise = createEntryApi({
        data: {
          content: value.trim(),
          media: apiMedia,
        },
      })
      toast.promise(promise, {
        loading: 'Recording thought…',
        success: 'Saved to sanctuary.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onSuccess: (entry) => {
      journalCache.insert(queryClient, entry)
    }
  })

  const updateEntry = useMutation({
    mutationFn: async ({ id, content, addedMedia, removedMediaIds }: { id: number; content: string; addedMedia: { base64Data: string }[]; removedMediaIds: number[] }) => {
      const promise = updateEntryApi({ data: { id, content, addedMedia, removedMediaIds } })
      toast.promise(promise, {
        loading: 'Updating…',
        success: 'Entry updated.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onMutate: async ({ id, content }) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.update(queryClient, id, {
        content,
        updatedAt: new Date(),
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        journalCache.restore(queryClient, context.previous)
      }
    },
    onSuccess: (updated, { id }) => {
      journalCache.update(queryClient, id, updated)
    }
  })

  const togglePin = useMutation({
    mutationFn: async (id: number) => {
      const promise = togglePinApi({ data: { id } })
      toast.promise(promise, {
        loading: 'Updating pin…',
        success: 'Pin toggled.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.togglePin(queryClient, id)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        journalCache.restore(queryClient, context.previous)
      }
    }
  })

  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteEntryApi({ data: { id } })
      toast.promise(promise, {
        loading: 'Deleting…',
        success: 'Entry deleted.',
        error: (err) => parseError(err).message,
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
    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      const entry = previous.flat?.find((e) => e.id === id)
      
      journalCache.remove(queryClient, id)
      if (entry) journalCache.moveToTrash(queryClient, entry)
      
      return { previous, entry, id }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        journalCache.restore(queryClient, context.previous)
      }
      if (context?.entry) {
        journalCache.removeFromTrash(queryClient, context.id)
      }
    }
  })

  const restoreEntry = useMutation({
    mutationFn: async (id: number) => {
      const promise = undeleteEntryApi({ data: { id } })
      toast.promise(promise, {
        loading: 'Restoring…',
        success: 'Entry restored.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.restoreFromTrash(queryClient, id)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        journalCache.restore(queryClient, context.previous)
      }
    }
  })

  const permanentDeleteEntry = useMutation({
    mutationFn: async (id: number) => {
      const promise = permanentDeleteEntryApi({ data: { id } })
      toast.promise(promise, {
        loading: 'Deleting…',
        success: 'Permanently deleted.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.removeFromTrash(queryClient, id)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        journalCache.restore(queryClient, context.previous)
      }
    }
  })

  return {
    createEntry,
    updateEntry,
    togglePin,
    deleteEntry,
    restoreEntry,
    permanentDeleteEntry,
  }
}
