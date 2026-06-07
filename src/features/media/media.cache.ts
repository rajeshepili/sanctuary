import type { QueryClient } from '@tanstack/react-query'
import { mediaKeys } from './media.keys'

export const mediaCache = {
  setDataUrl(
    queryClient: QueryClient,
    mediaId: number,
    thumbnailOnly: boolean,
    dataUrl: string | null,
  ) {
    queryClient.setQueryData(mediaKeys.detail(mediaId, thumbnailOnly), dataUrl)
  },

  invalidate(queryClient: QueryClient, mediaId: number) {
    queryClient.invalidateQueries({ queryKey: mediaKeys.detail(mediaId, true) })
    queryClient.invalidateQueries({
      queryKey: mediaKeys.detail(mediaId, false),
    })
  },
}
