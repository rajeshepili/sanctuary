import type { QueryClient } from '@tanstack/react-query'
import type { UserPreferences } from '#/types'
import { preferencesKeys } from './preferences.keys'

export const preferencesCache = {
  snapshot(queryClient: QueryClient): UserPreferences | null {
    return queryClient.getQueryData<UserPreferences>(preferencesKeys.all) ?? null
  },

  restore(queryClient: QueryClient, snapshot: UserPreferences): void {
    queryClient.setQueryData(preferencesKeys.all, snapshot)
  },

  patch(queryClient: QueryClient, patch: Partial<UserPreferences>): void {
    queryClient.setQueryData<UserPreferences>(
      preferencesKeys.all,
      (old) => (old ? { ...old, ...patch } : old),
    )
  },
}
