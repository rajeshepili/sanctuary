import { useState } from 'react'
import { useQuery, queryOptions } from '@tanstack/react-query'
import { getMedia } from '#/features/media/media.api'
import { withTimeout } from '#/lib/with-timeout'
import { Image as ImageIcon, Loader2, Maximize2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { Skeleton } from '#/components/ui/skeleton'

interface MediaImageProps {
  mediaId: number
}

export function MediaImage({ mediaId }: MediaImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const { data: thumbUrl, isLoading: thumbLoading } = useQuery(
    queryOptions({
      queryKey: ['media', mediaId, 'thumb'],
      queryFn: () =>
        withTimeout(
          () => getMedia({ data: { mediaId, thumbnailOnly: true } }),
          {
            name: `getMedia(${mediaId}, thumb)`,
          },
        ),
      staleTime: Infinity,
    }),
  )

  const { data: fullUrl, isLoading: fullLoading } = useQuery(
    queryOptions({
      queryKey: ['media', mediaId, 'full'],
      queryFn: () =>
        withTimeout(
          () => getMedia({ data: { mediaId, thumbnailOnly: false } }),
          {
            name: `getMedia(${mediaId}, full)`,
          },
        ),
      staleTime: Infinity,
      enabled: lightboxOpen,
    }),
  )

  if (thumbLoading) {
    return <Skeleton className="w-full h-32 rounded-xl" />
  }

  if (!thumbUrl) {
    return (
      <div className="w-full h-32 flex flex-col items-center justify-center bg-card/50 rounded-xl border border-dashed border-border/50 text-muted-foreground">
        <ImageIcon className="w-6 h-6 mb-2" />
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  }

  return (
    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-border/50 shadow-sm bg-black/5">
          <img
            src={thumbUrl}
            alt="Journal attachment"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ maxHeight: '400px' }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full text-white backdrop-blur-sm">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-1 bg-transparent border-none shadow-none flex items-center justify-center">
        <DialogTitle>View Image</DialogTitle>
        <DialogDescription>
          Full size view of the selected media image.
        </DialogDescription>
        {fullLoading ? (
          <div className="w-32 h-32 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <img
            src={fullUrl ?? thumbUrl}
            alt="Journal attachment expanded"
            className="max-w-full max-h-[90vh] object-contain rounded-md"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
