import type { ComponentType } from 'react'
import type { ThemeMood } from '#/types'

import { Day } from '../Day'
import { Evening } from '../Evening'
import { Morning } from '../Morning'
import { Night } from '../Night'

export interface SceneDefinition {
  mood: ThemeMood
  component: ComponentType
}

export const sceneRegistry: Record<ThemeMood, SceneDefinition> = {
  morning: {
    mood: 'morning',
    component: Morning,
  },
  day: {
    mood: 'day',
    component: Day,
  },
  evening: {
    mood: 'evening',
    component: Evening,
  },
  night: {
    mood: 'night',
    component: Night,
  },
}

export function getSceneComponent(mood: ThemeMood) {
  return sceneRegistry[mood].component
}
