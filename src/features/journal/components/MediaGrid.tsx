import { memo } from 'react'
import { MediaImage } from '#/features/journal/components/MediaImage'
import type { EntryMedia } from '#/types'

interface MediaGridProps {
  media: EntryMedia[]
  className?: string
}

export const MediaGrid = memo(function MediaGridComponent({
  media,
  className = '',
}: MediaGridProps) {
  if (media.length === 0) return null

  return (
    <div
      className={`mt-4 pt-4 border-t border-border/50 grid gap-3 ${
        media.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      } ${className}`}
    >
      {media.map((m) => (
        <MediaImage key={m.id} mediaId={m.id} />
      ))}
    </div>
  )
})
