import { cn } from '#/lib/utils'
import { Skeleton } from '#/components/ui/skeleton'

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full flex-1 bg-background px-5 py-6 sm:px-8 sm:py-8 pb-28 min-h-[calc(100dvh-3.5rem)]',
        className,
      )}
      aria-busy
      aria-label="Loading page"
    >
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-end pb-4 border-b border-border/30">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
