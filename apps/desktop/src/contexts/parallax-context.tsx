import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { MotionValue, useTransform } from 'framer-motion'

interface ParallaxContextValue {
  x: MotionValue<number>
  y: MotionValue<number>
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null)

export function ParallaxProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ParallaxContextValue
}) {
  return (
    <ParallaxContext.Provider value={value}>
      {children}
    </ParallaxContext.Provider>
  )
}

/**
 * Hook to get a parallax-adjusted offset for a specific depth.
 * @param depth - Range 0 to 1. 0 is static (infinite distance), 1 is maximum parallax (foreground).
 */
export function useParallaxLayer(depth: number) {
  const context = useContext(ParallaxContext)

  const x = useTransform(context?.x ?? new MotionValue(0), (val) => val * depth)
  const y = useTransform(context?.y ?? new MotionValue(0), (val) => val * depth)

  return { x, y }
}

export function useParallaxValues() {
  const context = useContext(ParallaxContext)
  if (!context) return { x: 0, y: 0 }
  return context
}
