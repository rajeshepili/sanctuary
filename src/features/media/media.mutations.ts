import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toastAsync } from '#/lib/toast-async'
import type { UploadMediaInput } from './media.schema'
import { uploadMedia } from './media.api'
import { mediaCache } from './media.cache'

export function useMediaMutations() {
  const queryClient = useQueryClient()

  const upload = useCallback(
    (data: UploadMediaInput) =>
      toastAsync(
        async () => {
          const saved = await uploadMedia({ data })
          mediaCache.invalidate(queryClient, saved.id)
          return saved
        },
        {
          loading: 'Saving memory…',
          success: 'Memory attached.',
          error: 'Failed to save media.',
        },
      ),
    [queryClient],
  )

  return { upload }
}
