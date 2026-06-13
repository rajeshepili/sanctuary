import { useCallback } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { toastAsync } from '#/lib/toast-async'
import { withOptimistic } from '#/lib/with-optimistic'
import type { UserPreferences } from '#/types'
import { preferencesCache } from './preferences.cache'
import { updatePreferences as updatePreferencesApi } from './preferences.api'
import type { UpdatePreferencesInput } from './preferences.schema'

export function usePreferencesMutations() {
  const queryClient = useQueryClient()

  const updatePreferences = useCallback(
    (patch: UpdatePreferencesInput) =>
      toastAsync(
        () =>
          withOptimistic(
            {
              snapshot: (qc: QueryClient) => preferencesCache.snapshot(qc),
              apply: (qc: QueryClient) => preferencesCache.patch(qc, patch),
              execute: () => updatePreferencesApi({ data: patch }),
              restore: (qc: QueryClient, snap: UserPreferences) =>
                preferencesCache.restore(qc, snap),
            },
            queryClient,
          ),
        {
          loading: 'Updating…',
          success: 'Settings updated.',
        },
      ),
    [queryClient],
  )

  return { updatePreferences }
}
