import type { QueryClient } from '@tanstack/react-query'
import type { CustomPrompt } from '#/types'
import { promptsKeys } from './prompts.keys'

export const promptsCache = {
  snapshot(queryClient: QueryClient): CustomPrompt[] | undefined {
    return queryClient.getQueryData<CustomPrompt[]>(promptsKeys.all)
  },

  restore(queryClient: QueryClient, snapshot: CustomPrompt[] | undefined) {
    queryClient.setQueryData(promptsKeys.all, snapshot)
  },

  insert(queryClient: QueryClient, prompt: CustomPrompt) {
    queryClient.setQueriesData<CustomPrompt[]>(
      { queryKey: promptsKeys.all },
      (old) => (old ? [prompt, ...old] : [prompt]),
    )
  },

  remove(queryClient: QueryClient, id: number) {
    queryClient.setQueriesData<CustomPrompt[]>(
      { queryKey: promptsKeys.all },
      (old) => (old ?? []).filter((p) => p.id !== id),
    )
  },

  update(queryClient: QueryClient, prompt: CustomPrompt) {
    queryClient.setQueriesData<CustomPrompt[]>(
      { queryKey: promptsKeys.all },
      (old) => (old ?? []).map((p) => (p.id === prompt.id ? prompt : p)),
    )
  },
}
