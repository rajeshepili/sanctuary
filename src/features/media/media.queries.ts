import { useQuery } from '@tanstack/react-query'
import { mediaQueryOptions } from './media.options'

export function useMediaQuery(mediaId: number, thumbnailOnly = false) {
  return useQuery({
    ...mediaQueryOptions(mediaId, thumbnailOnly),
    enabled: mediaId > 0,
  })
}
