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
      <section
        className={cn("relative shrink-0 h-[50dvh] flex items-center justify-center", immersive && "h-dvh")}
        aria-label="Scene"
      >
        <div className="relative z-10">
          <LiveClock />
        </div>
      </section>

      <FocusSection immersive={immersive} className={className}>
        {children}
      </FocusSection>
    </>
  )
}
