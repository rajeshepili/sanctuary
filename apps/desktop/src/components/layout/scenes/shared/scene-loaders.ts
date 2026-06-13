import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { ThemeMood } from '#/types'

export const sceneLoaders: Record<
  ThemeMood,
  LazyExoticComponent<ComponentType>
> = {
  morning: lazy(() =>
    import('../Morning').then((m) => ({ default: m.Morning })),
  ),
  day: lazy(() => import('../Day').then((m) => ({ default: m.Day }))),
  evening: lazy(() =>
    import('../Evening').then((m) => ({ default: m.Evening })),
  ),
  night: lazy(() => import('../Night').then((m) => ({ default: m.Night }))),
}
