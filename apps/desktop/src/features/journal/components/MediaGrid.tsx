import { memo, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Image as ImageIcon, Maximize2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Skeleton } from '#/components/ui/skeleton'
import { getMediaAssetUrl } from '#/infrastructure/media/media.urls'
import type { EntryMedia } from '#/types'

// ─── Thumbnail cell ───────────────────────────────────────────────────────────

interface ThumbProps {
  mediaId: number
  /** Extra CSS classes for shaping individual cells in different grid layouts */
  className?: string
  /** Called when the user clicks to open the lightbox */
  onClick: () => void
  /** Show a "+N" badge (for the last visible cell when there are more) */
  overflow?: number
}

function Thumb({ mediaId, className = '', onClick, overflow }: ThumbProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted/30 border border-dashed border-border/40 rounded-2xl text-muted-foreground/50 gap-1.5 ${className}`}
      >
        <ImageIcon className="w-4 h-4" />
        <span className="text-[10px]">Unavailable</span>
      </div>
    )
  }

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-black/10 ${className}`}
      onClick={onClick}
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

      {/* Hover overlay */}
      {loaded && (
        <motion.div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center"
          initial={false}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
            {overflow ? (
              <span className="text-white text-xl font-semibold drop-shadow-lg">
                +{overflow}
              </span>
            ) : (
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Full-size lightbox ────────────────────────────────────────────────────────

interface LightboxProps {
  media: EntryMedia[]
  startIndex: number
  onClose: () => void
}

function Lightbox({ media, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)
  const [direction, setDirection] = useState(0)

  const go = useCallback(
    (delta: number) => {
      setDirection(delta)
      setIndex((i) => (i + delta + media.length) % media.length)
    },
    [media.length],
  )

  const current = media[index]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {media.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/15 backdrop-blur-md">
          {index + 1} / {media.length}
        </div>
      )}

      {/* Prev */}
      {media.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-colors"
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.img
          key={current.id}
          src={getMediaAssetUrl(current.id, false)}
          alt="Journal attachment expanded"
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="max-w-[90vw] max-h-[88vh] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Next */}
      {media.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-colors"
          onClick={(e) => { e.stopPropagation(); go(1) }}
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dot indicators */}
      {media.length > 1 && media.length <= 8 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={(e) => { e.stopPropagation(); setDirection(i - index); setIndex(i) }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === index ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Grid layout logic ────────────────────────────────────────────────────────

/** Max thumbnails shown before overflow badge */
const MAX_VISIBLE = 4

function getGridLayout(count: number) {
  if (count === 1) return { cols: 'grid-cols-1', heights: ['aspect-[4/3]'] }
  if (count === 2) return { cols: 'grid-cols-2', heights: ['aspect-square', 'aspect-square'] }
  if (count === 3) return { cols: 'grid-cols-2', heights: ['aspect-square row-span-2', 'aspect-[2/1.5]', 'aspect-[2/1.5]'] }
  // 4+
  return { cols: 'grid-cols-2', heights: ['aspect-square', 'aspect-square', 'aspect-square', 'aspect-square'] }
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface MediaGridProps {
  media: EntryMedia[]
  className?: string
}

export const MediaGrid = memo(function MediaGridComponent({
  media,
  className = '',
}: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (media.length === 0) return null

  const visible = media.slice(0, MAX_VISIBLE)
  const overflow = media.length > MAX_VISIBLE ? media.length - MAX_VISIBLE + 1 : 0
  const { cols, heights } = getGridLayout(Math.min(media.length, MAX_VISIBLE))

  return (
    <>
      <div className={`pt-4 border-t border-border/30 mt-4 max-w-md ${className}`}>
        <div className={`grid gap-2 ${cols}`}>
          {visible.map((m, i) => {
            const isLastVisible = i === visible.length - 1
            const showOverflow = isLastVisible && overflow > 0
            return (
              <Thumb
                key={m.id}
                mediaId={m.id}
                className={heights[i] ?? 'aspect-square'}
                onClick={() => setLightboxIndex(i)}
                overflow={showOverflow ? overflow : undefined}
              />
            )
          })}
        </div>

        {media.length > 1 && (
          <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 text-right">
            {media.length} photo{media.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            media={media}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
})
