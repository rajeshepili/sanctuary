import type { ThemeMood } from '#/types'
import { useEffect, useRef, useState } from 'react'
import SunCalc from 'suncalc'

function deriveMoodFromTime(): ThemeMood {
  const h = new Date().getHours()
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
  const hasPrefLocation = options?.lat != null && options.lng != null

  const getInitialMood = (): ThemeMood => {
    if (hasPrefLocation) {
      return deriveMoodFromSun(options.lat!, options.lng!)
    }
    return deriveMoodFromTime()
  }

  const [mood, setMood] = useState<ThemeMood>(getInitialMood)
  const latRef = useRef(options?.lat)
  const lngRef = useRef(options?.lng)

  useEffect(() => {
    latRef.current = options?.lat
    lngRef.current = options?.lng
    const lat = options?.lat
    const lng = options?.lng
    if (lat != null && lng != null) {
      setMood(deriveMoodFromSun(lat, lng))
    } else {
      setMood(deriveMoodFromTime())
    }
  }, [options?.lat, options?.lng])

  useEffect(() => {
    const tick = () => {
      if (latRef.current != null && lngRef.current != null) {
        setMood(deriveMoodFromSun(latRef.current, lngRef.current))
      } else {
        setMood(deriveMoodFromTime())
      }
    }

    const interval = setInterval(tick, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return mood
}
