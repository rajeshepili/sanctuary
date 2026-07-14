import { useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

/**
 * A simple 1D noise-like function using sine waves of different frequencies.
 */
function simpleNoise(t: number) {
  return (
    Math.sin(t) * 0.5 +
    Math.sin(t * 1.5 + 1.2) * 0.25 +
    Math.sin(t * 0.7 - 0.5) * 0.15 +
    Math.sin(t * 2.1 + 2.5) * 0.1
  )
}

interface NoisePathConfig {
  speed?: number
  magnitude?: number
  offset?: number
  springConfig?: { stiffness?: number; damping?: number; mass?: number }
}

/**
 * Custom hook to generate organic, noise-like movement values.
 */
export function useNoiseValue({
  speed = 1,
  magnitude = 10,
  offset = 0,
  springConfig = { stiffness: 50, damping: 20 },
}: NoisePathConfig = {}) {
  const value = useMotionValue(0)
  const spring = useSpring(value, springConfig)
  const timeRef = useRef(offset)

  useEffect(() => {
    let frameId: number

    const update = () => {
      timeRef.current += 0.016 * speed

      const noise = simpleNoise(timeRef.current)
      value.set(noise * magnitude)

      frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [speed, magnitude, value])

  return spring
}
