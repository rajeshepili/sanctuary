import { useQueryClient, useMutation } from '@tanstack/react-query'
import { parseError } from '#/lib/error-parser'
import type { UserPreferences } from '#/types'
import { preferencesCache } from './preferences.cache'
import { preferencesKeys } from './preferences.keys'
import { updatePreferences as updatePreferencesApi } from './preferences.api'
import type { UpdatePreferencesInput } from './preferences.schema'

export function usePreferencesMutations() {
  const queryClient = useQueryClient()

  const updatePreferences = useMutation({
    mutationFn: (patch: UpdatePreferencesInput) =>
      updatePreferencesApi({ data: patch }),

    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: preferencesKeys.all })
      const previous = preferencesCache.snapshot(queryClient)
      preferencesCache.patch(queryClient, patch)
      return { previous }
    },

    onSuccess: (confirmed) => {
      // Sync cache with the server-confirmed record (e.g. onboardedAt may have been stamped).
      queryClient.setQueryData<UserPreferences>(preferencesKeys.all, confirmed)
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        preferencesCache.restore(queryClient, context.previous)
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: preferencesKeys.all })
    },

    meta: {
      errorHandler: (err: unknown) => parseError(err).message,
    },
  })

  return { updatePreferences }
}
