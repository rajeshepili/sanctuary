import { Suspense, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { ThemeMood } from '#/types'

import { sceneLoaders } from './scenes/shared/scene-loaders'

interface Props {
  mood: ThemeMood
}

export function Background({ mood }: Props) {
  const Scene = sceneLoaders[mood]
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Defer scene rendering until after first meaningful paint
    const timer = setTimeout(() => setShouldRender(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!shouldRender) {
    return <div className="fixed inset-0 bg-background pointer-events-none z-0" aria-hidden />
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <AnimatePresence mode="sync">
        <Suspense fallback={null}>
          <Scene key={mood} />
        </Suspense>
      </AnimatePresence>
    </div>
  )
}
