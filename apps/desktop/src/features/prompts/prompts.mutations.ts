import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toastAsync } from '#/lib/toast-async'
import { promptsCache } from './prompts.cache'
import {
  addPrompt as addPromptApi,
  updatePrompt as updatePromptApi,
  deletePrompt as deletePromptApi,
} from './prompts.api'

export function usePromptsMutations() {
  const queryClient = useQueryClient()

  const addPrompt = useCallback(
    (text: string) =>
      toastAsync(
        async () => {
          const prompt = await addPromptApi({ data: { text } })
          promptsCache.insert(queryClient, prompt)
        },
        {
          loading: 'Adding prompt…',
          success: 'Prompt added.',
        },
      ),
    [queryClient],
  )

  const updatePrompt = useCallback(
    (id: number, text: string) =>
      toastAsync(
        async () => {
          const prompt = await updatePromptApi({ data: { id, text } })
          promptsCache.update(queryClient, prompt)
        },
        {
          loading: 'Updating…',
          success: 'Updated.',
        },
      ),
    [queryClient],
  )

  const deletePrompt = useCallback(
    (id: number) =>
      toastAsync(
        async () => {
          await deletePromptApi({ data: { id } })
          promptsCache.remove(queryClient, id)
        },
        { loading: 'Removing…', success: 'Removed.' },
      ),
    [queryClient],
  )

  return { addPrompt, updatePrompt, deletePrompt }
}
