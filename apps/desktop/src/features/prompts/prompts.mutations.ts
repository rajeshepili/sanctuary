import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { parseError } from '#/lib/error-parser'
import { promptsCache } from './prompts.cache'
import {
  addPrompt as addPromptApi,
  updatePrompt as updatePromptApi,
  deletePrompt as deletePromptApi,
} from './prompts.api'

export function usePromptsMutations() {
  const queryClient = useQueryClient()

  const addPrompt = useMutation({
    mutationFn: async (text: string) => {
      const promise = addPromptApi({ data: { text } })
      toast.promise(promise, {
        loading: 'Adding prompt…',
        success: 'Prompt added.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onSuccess: (prompt) => {
      promptsCache.insert(queryClient, prompt)
    }
  })

  const updatePrompt = useMutation({
    mutationFn: async ({ id, text }: { id: number; text: string }) => {
      const promise = updatePromptApi({ data: { id, text } })
      toast.promise(promise, {
        loading: 'Updating…',
        success: 'Updated.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onSuccess: (prompt) => {
      promptsCache.update(queryClient, prompt)
    }
  })

  const deletePrompt = useMutation({
    mutationFn: async (id: number) => {
      const promise = deletePromptApi({ data: { id } })
      toast.promise(promise, {
        loading: 'Removing…',
        success: 'Removed.',
        error: (err) => parseError(err).message,
      })
      return promise
    },
    onSuccess: (_, id) => {
      promptsCache.remove(queryClient, id)
    }
  })

  return { addPrompt, updatePrompt, deletePrompt }
}
