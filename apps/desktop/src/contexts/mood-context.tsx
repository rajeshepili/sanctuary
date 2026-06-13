import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { ThemeMood } from '#/types'
import { useMood } from '#/hooks/use-mood'
import { useUIStore } from '#/stores/ui-store'

const MoodContext = createContext<ThemeMood>('day')

export function MoodProvider({
  children,
  lat,
  lng,
}: {
  children: ReactNode
  lat?: number | null
  lng?: number | null
}) {
  const mood = useMood({ lat, lng })
  const { forcedMood } = useUIStore()

  const activeMood = forcedMood || mood

  return (
    <MoodContext.Provider value={activeMood}>{children}</MoodContext.Provider>
  )
}

export function useMoodContext() {
  return useContext(MoodContext)
}
