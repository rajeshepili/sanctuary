import { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { ThemeMood } from '#/types'

import { sceneLoaders } from './scenes/shared/scene-loaders'

interface Props {
  mood: ThemeMood
}

export function Background({ mood }: Props) {
  const Scene = sceneLoaders[mood]

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
