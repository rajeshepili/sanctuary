import { IconButton } from '#/components/ui/icon-button'
import { X } from 'lucide-react'

interface Props {
  media: { file: File; base64: string }[]
  onRemove: (index: number) => void
}

export function JournalPendingMedia({ media, onRemove }: Props) {
  if (media.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 pt-3">
      {media.map((item, idx) => (
        <div
          key={idx}
          className="relative group rounded-lg overflow-hidden border border-border/50"
        >
          <img
            src={item.base64}
            alt="Pending attachment"
            className="h-20 w-auto object-cover"
          />
          <IconButton
            tooltip="Remove image"
            onClick={() => onRemove(idx)}
            className="absolute top-1 right-1 p-0.5 w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
          >
            <X className="w-3 h-3" />
          </IconButton>
        </div>
      ))}
    </div>
  )
}
