import type { QueryClient } from '@tanstack/react-query'
import type { UserPreferences } from '#/types'
import { preferencesKeys } from './preferences.keys'

export const preferencesCache = {
  snapshot(queryClient: QueryClient): UserPreferences {
    const data = queryClient.getQueryData<UserPreferences>(preferencesKeys.all)
    if (!data) {
      throw new Error('Missing preferences cache')
    }
    return data
  },

  restore(queryClient: QueryClient, snapshot: UserPreferences): void {
    queryClient.setQueryData(preferencesKeys.all, snapshot)
  },

  patch(queryClient: QueryClient, patch: Partial<UserPreferences>): void {
    queryClient.setQueryData<UserPreferences>(
      preferencesKeys.all,
      (old: UserPreferences | undefined) => {
        if (!old) {
          throw new Error('Missing preferences cache')
        }
        return { ...old, ...patch }
      },
    )
  },
}
