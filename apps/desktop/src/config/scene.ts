import type { ThemeMood } from '#/types'

export const sceneConfig: Record<
  ThemeMood,
  { label: string; hint: string; glow: string; border: string }
> = {
  morning: {
    label: 'Good Morning',
    hint: 'A fresh start to your day.',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  day: {
    label: 'Good Day',
    hint: 'Bright skies, active minds, and progress.',
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  evening: {
    label: 'Good Evening',
    hint: 'Warmth of the evening.',
    glow: 'rgba(244, 63, 94, 0.4)',
    border: 'rgba(244, 63, 94, 0.35)',
  },
  night: {
    label: 'Good Night',
    hint: 'Peaceful night.',
    glow: 'rgba(99, 102, 241, 0.4)',
    border: 'rgba(99, 102, 241, 0.35)',
  },
}
