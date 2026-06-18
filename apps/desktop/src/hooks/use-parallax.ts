import { useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

interface ParallaxConfig {
  magnitude?: number
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
}

export function useParallax({
  magnitude = 20,
  springConfig = { stiffness: 100, damping: 30, mass: 1 },
}: ParallaxConfig = {}) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const centerX = innerWidth / 2
      const centerY = innerHeight / 2

      // Normalize distance from center to -1 to 1
      const normalizedX = (e.clientX - centerX) / centerX
      const normalizedY = (e.clientY - centerY) / centerY

      mouseX.set(normalizedX * magnitude)
      mouseY.set(normalizedY * magnitude)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [magnitude, mouseX, mouseY])

  return { x, y }
}
