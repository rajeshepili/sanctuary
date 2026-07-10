import { useNoiseValue } from './use-noise'

interface ParallaxConfig {
  magnitude?: number
  speed?: number
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
}

/**
 * Refactored useParallax: Now performs autonomous organic drifting
 * by composing two instances of useNoiseValue (one for X, one for Y).
 */
export function useParallax({
  magnitude = 20,
  speed = 0.4,
  springConfig = { stiffness: 40, damping: 20, mass: 1 },
}: ParallaxConfig = {}) {
  // Use a random base offset so multiple elements don't sync up perfectly
  const baseOffset = Math.random() * 100

  // X drift
  const x = useNoiseValue({
    speed,
    magnitude,
    offset: baseOffset,
    springConfig,
  })

  // Y drift uses a slight speed variation and a completely different offset
  // to ensure the X and Y paths don't look perfectly diagonal or locked.
  const y = useNoiseValue({
    speed: speed * 0.8,
    magnitude,
    offset: baseOffset + 50,
    springConfig,
  })

  return { x, y }
}
