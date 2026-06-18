import { createContext, useContext, ReactNode } from 'react'
import { MotionValue } from 'framer-motion'

interface ParallaxContextValue {
  x: MotionValue<number>
  y: MotionValue<number>
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null)

export function ParallaxProvider({ 
  children, 
  value 
}: { 
  children: ReactNode, 
  value: ParallaxContextValue 
}) {
  return (
    <ParallaxContext.Provider value={value}>
      {children}
    </ParallaxContext.Provider>
  )
}

export function useParallaxValues() {
  const context = useContext(ParallaxContext)
  if (!context) return { x: 0, y: 0 }
  return context
}
