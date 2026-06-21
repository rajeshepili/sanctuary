import { useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

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
 * A simple 1D noise-like function using sine waves.
 */
function simpleNoise(t: number) {
  return (
    Math.sin(t) * 0.5 +
    Math.sin(t * 1.5 + 1.2) * 0.25 +
    Math.sin(t * 0.7 - 0.5) * 0.15 +
    Math.sin(t * 2.1 + 2.5) * 0.1
  )
}

/**
 * Refactored useParallax: Now performs autonomous organic drifting
 * instead of reacting to mouse movements.
 */
export function useParallax({
  magnitude = 20,
  speed = 0.4,
  springConfig = { stiffness: 40, damping: 20, mass: 1 },
}: ParallaxConfig = {}) {
  const driftX = useMotionValue(0)
  const driftY = useMotionValue(0)

  const x = useSpring(driftX, springConfig)
  const y = useSpring(driftY, springConfig)

  const timeRef = useRef(Math.random() * 100)

  useEffect(() => {
    let frameId: number

    const update = () => {
      timeRef.current += 0.016 * speed

      // Generate two different noise values for X and Y
      const noiseX = simpleNoise(timeRef.current)
      const noiseY = simpleNoise(timeRef.current * 0.8 + 50)

      driftX.set(noiseX * magnitude)
      driftY.set(noiseY * magnitude)

      frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [magnitude, speed, driftX, driftY])

  return { x, y }
}
