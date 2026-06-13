import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ThemeMood } from '#/types'

import { Grain, sceneFade } from './Grain'

interface SceneShellProps {
  mood: ThemeMood
  children: ReactNode
  grainOpacity?: number
  className?: string
}

export function SceneShell({
  mood,
  children,
  grainOpacity = 0.04,
  className = '',
}: SceneShellProps) {
  return (
    <motion.div
      {...sceneFade}
      data-scene={mood}
      className={`absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      {children}
      <Grain opacity={grainOpacity} />
    </motion.div>
  )
}
