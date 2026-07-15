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
        // flex-1 + min-h-0 = correct flexbox shrink without overflowing the parent
        // The parent (AppShell scroll area) is already overflow-y-auto,
        // so this just fills available space. Never use min-h-dvh here.
        'relative z-20 w-full flex-1 min-h-0 bg-background flex flex-col',
        'px-5 py-6 sm:px-8 sm:py-8 pb-28',
        immersive && 'hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
