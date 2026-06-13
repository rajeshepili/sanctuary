import type { ThemeMood } from '#/types'
import { useEffect, useState } from 'react'
import SunCalc from 'suncalc'

function deriveMoodFromTime(): ThemeMood {
  const now = new Date()
  const h = now.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 19) return 'day'
  if (h >= 19 && h < 22) return 'evening'
  return 'night'
}

function deriveMoodFromSun(lat: number, lng: number): ThemeMood {
  const now = new Date()
  const times = SunCalc.getTimes(now, lat, lng)

  const ms = now.getTime()
  const dawn = times.dawn.getTime()
  const sunrise = times.sunrise.getTime()
  const noon = times.solarNoon.getTime()
  const sunset = times.sunset.getTime()
  const dusk = times.dusk.getTime()

  const isPolarDay =
    isNaN(times.sunrise.getTime()) && isNaN(times.sunset.getTime())

  if (isPolarDay) {
    return deriveMoodFromTime()
  }

  if (ms < dawn) return 'night'
  if (ms < sunrise) return 'morning'
  if (ms < noon) return 'day'
  if (ms < sunset) return 'day'
  if (ms < dusk) return 'evening'
  return 'night'
}

export interface UseMoodOptions {
  lat?: number | null
  lng?: number | null
}

export function useMood(options?: UseMoodOptions): ThemeMood {
  const lat = options?.lat
  const lng = options?.lng

  const getMood = (): ThemeMood => {
    if (lat != null && lng != null) {
      return deriveMoodFromSun(lat, lng)
    }
    return deriveMoodFromTime()
  }

  const [mood, setMood] = useState<ThemeMood>(getMood)

  useEffect(() => {
    // Update immediately when location changes
    setMood(getMood())

    const tick = () => {
      setMood(getMood())
    }

    const interval = setInterval(tick, 60 * 1000)
    return () => clearInterval(interval)
  }, [lat, lng])

  return mood
}
