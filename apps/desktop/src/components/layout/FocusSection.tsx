import { cn } from '#/lib/utils'

export function FocusSection({
  children,
  className,
  immersive = false,
}: {
  children: React.ReactNode
  className?: string
  immersive?: boolean
}) {
  return (
    <div
      className={cn(
        'relative z-20 w-full flex-1 bg-background flex flex-col overflow-y-auto',
        'px-5 py-6 sm:px-8 sm:py-8 pb-28',
        immersive
          ? 'min-h-dvh'
          : 'min-h-[calc(100dvh-3.5rem)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
