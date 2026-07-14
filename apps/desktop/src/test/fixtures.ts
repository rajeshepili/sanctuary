import type { HabitFrequency, HabitPriority, HabitStatus } from '#/types/index'

export const createEntryFixture = (
  overrides?: Partial<{
    content: string
    tags: string | null
    isPinned: boolean
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }>,
) => {
  const now = new Date()
  return {
    content: 'Test journal entry content',
    tags: 'test',
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null as Date | null,
    ...overrides,
  }
}

export const createMediaFixture = (
  entryId: number,
  overrides?: Partial<{
    filePath: string
    thumbnailPath: string
    mimeType: string
    fileSize: number
    createdAt: Date
  }>,
) => ({
  entryId,
  filePath: '/test/media/image.webp',
  thumbnailPath: '/test/media/image-thumb.webp',
  mimeType: 'image/webp',
  fileSize: 102400,
  createdAt: new Date(),
  ...overrides,
})

export const createHabitFixture = (
  overrides?: Partial<{
    name: string
    frequency: HabitFrequency
    interval: number
    daysOfWeek: number[] | null
    priority: HabitPriority
    categoryId: number | null
    status: HabitStatus
    intention: string | null
    createdAt: Date
  }>,
) => ({
  name: 'Test Habit',
  frequency: 'daily' as const,
  interval: 1,
  daysOfWeek: null,
  priority: 'low' as const,
  categoryId: null,
  status: 'active' as const,
  intention: null,
  createdAt: new Date(),
  ...overrides,
})

export const createHabitCompletionFixture = (
  habitId: number,
  overrides?: Partial<{ completedAt: string }>,
) => ({
  habitId,
  completedAt: new Date().toISOString().split('T')[0],
  ...overrides,
})

export const createUserPreferencesFixture = (
  overrides?: Partial<{
    name: string | null
    onboardedAt: Date | null
    disclaimerAgreed: boolean
    privacyPin: string | null
    latitude: number | null
    longitude: number | null
    locationLabel: string | null
  }>,
) => ({
  name: 'Test User',
  onboardedAt: new Date(),
  disclaimerAgreed: true,
  privacyPin: null as string | null,
  latitude: null as number | null,
  longitude: null as number | null,
  locationLabel: null as string | null,
  ...overrides,
})

/** YYYY-MM-DD date string for habit completion tests. */
export const formatDate = (date: Date = new Date()): string =>
  date.toISOString().split('T')[0]
