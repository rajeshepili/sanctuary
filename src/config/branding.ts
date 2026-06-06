/**
 * Public-facing product name and shared UI copy for Sanctuary.
 */

export const APP_NAME = 'Sanctuary'

export const APP_TAGLINE =
  'A local, private journal and habit tracker for one person on one device.'

export const APP_META_DESCRIPTION =
  'Local-first journal, habits, and reflection — your data stays on your device.'

export const APP_REPO_URL = 'https://github.com/rajeshepili/sanctuary'

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/journal', label: 'Journal' },
  { to: '/habits', label: 'Habits' },
  { to: '/prompts', label: 'Prompts' },
] as const

export const PAGE_TITLES = {
  home: 'Home',
  journal: 'Journal',
  habits: 'Habits',
  prompts: 'Prompts',
} as const

export const PAGE_DESCRIPTIONS = {
  home: 'Reflect on your day and capture what matters.',
  journal: 'Search and read your past reflections.',
  habits: 'Track habits and review your consistency over time.',
  prompts:
    'A collection of ideas to inspire your reflections. Prompts will appear in your Journal widget or can be used directly from here.',
} as const
