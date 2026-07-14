import { Suspense, memo } from 'react'
import type { ThemeMood } from '#/types'
import { sceneLoaders } from './scenes/shared/scene-loaders'
import { useParallax } from '#/hooks/use-parallax'
import { ParallaxProvider } from '#/contexts/parallax-context'
import { cn } from '#/lib/utils'

interface Props {
  mood: ThemeMood
}

const MOODS: ThemeMood[] = ['morning', 'day', 'evening', 'night']

function BackgroundScene({ mood }: { mood: ThemeMood }) {
  return (
    <>
      {MOODS.map((m) => {
        const Scene = sceneLoaders[m]
        return (
          <div
            key={m}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1.5s] ease-in-out',
              m === mood ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden={m !== mood}
          >
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </div>
        )
      })}
    </>
  )
}

export const Background = memo(function Background({ mood }: Props) {
  const parallax = useParallax({ magnitude: 6 })

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-background"
      aria-hidden
    >
      <ParallaxProvider value={parallax}>
        <BackgroundScene mood={mood} />
      </ParallaxProvider>
    </div>
  )
})
