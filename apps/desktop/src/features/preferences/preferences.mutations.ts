import { useQueryClient, useMutation } from '@tanstack/react-query'
import { parseError } from '#/lib/error-parser'
import { toast } from 'sonner'
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
      queryClient.setQueryData<UserPreferences>(preferencesKeys.all, confirmed)
    },

    onError: (err, _vars, context) => {
      if (context?.previous) {
        preferencesCache.restore(queryClient, context.previous)
      }
      toast.error(`Could not update preferences — ${parseError(err).message}`)
    },
  })

  return { updatePreferences }
}
