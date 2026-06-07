import { queryOptions } from '@tanstack/react-query'
import { getMedia } from './media.api'
import { mediaKeys } from './media.keys'
import { withTimeout } from '#/lib/with-timeout'

export const mediaQueryOptions = (mediaId: number, thumbnailOnly = false) =>
  queryOptions({
    queryKey: mediaKeys.detail(mediaId, thumbnailOnly),
    queryFn: () =>
      withTimeout(() => getMedia({ data: { mediaId, thumbnailOnly } }), {
        name: `getMedia(${mediaId})`,
      }),
    staleTime: Infinity,
  })
