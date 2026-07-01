import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Maximize2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { Skeleton } from '#/components/ui/skeleton'
import { getMediaAssetUrl } from '#/infrastructure/media/media.urls'

interface MediaImageProps {
  mediaId: number
}

/**
 * Standalone image card with its own lightbox.
 * Used by the read-only journal view when only 1 image is present,
 * and by the editor's attachment gallery.
 * For multi-image grids, MediaGrid owns the lightbox and uses Thumb internally.
 */
export function MediaImage({ mediaId }: MediaImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)

  if (failed) {
    return (
      <div className="w-full aspect-4/3 flex flex-col items-center justify-center bg-muted/30 rounded-2xl border border-dashed border-border/40 text-muted-foreground/50 gap-2">
        <ImageIcon className="w-5 h-5" />
        <span className="text-xs">Image not available</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className="relative group cursor-pointer overflow-hidden rounded-2xl bg-black/10 aspect-4/3 w-full max-w-md"
        onClick={() => loaded && setOpen(true)}
      >
        {!loaded && <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />}

        <motion.img
          src={getMediaAssetUrl(mediaId, true)}
          alt="Journal attachment"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />

        {loaded && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-2 bg-black/90 border-white/10 shadow-2xl flex items-center justify-center rounded-2xl">
        <DialogTitle className="sr-only">View Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of the selected media image.</DialogDescription>
        <img
          src={getMediaAssetUrl(mediaId, false)}
          alt="Journal attachment expanded"
          className="max-w-full max-h-[88vh] object-contain rounded-xl"
        />
      </DialogContent>
    </Dialog>
  )
}
