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
import type { JournalMood } from '#/types'

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useJournalMutations() {
  const queryClient = useQueryClient()

  // ── Create ──────────────────────────────────────────────────────────────
  const createEntry = useMutation({
    mutationFn: ({
      content,
      mood,
      media,
    }: {
      content: string
      mood: JournalMood | null
      media: { base64Data: string }[]
    }) => createEntryApi({ data: { content: content.trim(), mood, media } }),

    onSuccess: (entry) => {
      journalCache.insert(queryClient, entry)
      toast.success('Saved to Sanctuary.')
    },
    onError: (err) => {
      toast.error(`Could not save entry — ${parseError(err).message}`)
    },
  })

  // ── Update ───────────────────────────────────────────────────────────────
  const updateEntry = useMutation({
    mutationFn: ({
      id,
      content,
      mood,
      addedMedia,
      removedMediaIds,
    }: {
      id: number
      content: string
      mood: JournalMood | null
      addedMedia: { base64Data: string }[]
      removedMediaIds: number[]
    }) =>
      updateEntryApi({
        data: { id, content, mood, addedMedia, removedMediaIds },
      }),

    onMutate: async ({ id, content, mood }) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.update(queryClient, id, {
        content,
        mood,
        updatedAt: new Date(),
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) journalCache.restore(queryClient, context.previous)
      toast.error('Could not update entry.')
    },
    onSuccess: (updated, { id }) => {
      journalCache.update(queryClient, id, updated)
      toast.success('Entry updated.')
    },
  })

  // ── Toggle Pin ───────────────────────────────────────────────────────────
  const togglePin = useMutation({
    mutationFn: (id: number) => togglePinApi({ data: { id } }),

    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.togglePin(queryClient, id)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) journalCache.restore(queryClient, context.previous)
      toast.error('Could not update pin.')
    },
    onSuccess: (_result, id) => {
      // Server response is authoritative — update the full entry in cache
      journalCache.update(queryClient, id, _result)
    },
  })

  // ── Delete (soft) ────────────────────────────────────────────────────────
  const deleteEntry = useMutation({
    mutationFn: (id: number) => deleteEntryApi({ data: { id } }),

    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      const entry = previous.flat?.find((e) => e.id === id)

      journalCache.remove(queryClient, id)
      if (entry) journalCache.moveToTrash(queryClient, entry)

      return { previous, entry, id }
    },
    onError: (_err, _vars, context) => {
      // Roll back optimistic removal
      if (context?.previous) journalCache.restore(queryClient, context.previous)
      if (context?.entry) journalCache.removeFromTrash(queryClient, context.id)
      toast.error('Could not delete entry.')
    },
    onSuccess: (_result, id) => {
      toast('Reflection moved to trash.', {
        duration: 8000,
        action: {
          label: 'Undo',
          onClick: () => {
            // Fire-and-forget restore — handled by its own mutation
            restoreEntry.mutate(id)
          },
        },
      })
    },
  })

  // ── Restore ──────────────────────────────────────────────────────────────
  const restoreEntry = useMutation({
    mutationFn: (id: number) => undeleteEntryApi({ data: { id } }),

    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.restoreFromTrash(queryClient, id)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) journalCache.restore(queryClient, context.previous)
      toast.error('Could not restore entry.')
    },
    onSuccess: () => {
      toast.success('Entry restored.')
    },
  })

  // ── Permanent Delete ──────────────────────────────────────────────────────
  const permanentDeleteEntry = useMutation({
    mutationFn: (id: number) => permanentDeleteEntryApi({ data: { id } }),

    onMutate: async (id) => {
      const previous = journalCache.snapshot(queryClient)
      journalCache.removeFromTrash(queryClient, id)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) journalCache.restore(queryClient, context.previous)
      toast.error('Could not permanently delete entry.')
    },
    onSuccess: () => {
      toast.success('Permanently deleted.')
    },
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
