import { Suspense, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ThemeMood } from '#/types'

import { sceneLoaders } from './scenes/shared/scene-loaders'
import { useParallax } from '#/hooks/use-parallax'
import { ParallaxProvider } from '#/hooks/parallax-context'

interface Props {
  mood: ThemeMood
}

export function Background({ mood }: Props) {
  const Scene = sceneLoaders[mood]
  const [shouldRender, setShouldRender] = useState(false)
  const parallax = useParallax({ magnitude: 12 })

  useEffect(() => {
    // Defer scene rendering until after first meaningful paint
    const timer = setTimeout(() => setShouldRender(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!shouldRender) {
    return <div className="fixed inset-0 bg-background pointer-events-none z-0" aria-hidden />
  }

  return (
    <motion.div
      style={{ x: parallax.x, y: parallax.y, scale: 1.03 }}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <ParallaxProvider value={parallax}>
        <AnimatePresence mode="sync">
          <Suspense fallback={null}>
            <Scene key={mood} />
          </Suspense>
        </AnimatePresence>
      </ParallaxProvider>
    </motion.div>
  )
}
