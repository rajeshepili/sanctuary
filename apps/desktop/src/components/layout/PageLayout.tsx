import { useSuspenseQuery } from '@tanstack/react-query'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'
import { FocusSection } from './FocusSection'
import { LiveClock } from './Clock'
import { cn } from '#/lib/utils'

type PageLayoutProps = {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  const { data: prefs } = useSuspenseQuery(preferencesQueryOptions())
  const immersive = prefs.layoutMode === 'immersive'

  return (
    <>
      {/* Scene / Hero — clock lives here against the animated background */}
      <section
        className={cn(
          'relative shrink-0 flex items-center justify-center',
          // Proportionate hero: takes ~38% of viewport in standard mode.
          // Full-screen only in immersive mode.
          immersive ? 'h-dvh' : 'h-[38dvh]',
        )}
        aria-label="Scene"
      >
        <div className="relative z-10">
          <LiveClock />
        </div>

        {/* Gradient fade so the scene blends cleanly into the content card below */}
        {!immersive && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
        )}
      </section>

      <FocusSection immersive={immersive} className={className}>
        {children}
      </FocusSection>
    </>
  )
}
