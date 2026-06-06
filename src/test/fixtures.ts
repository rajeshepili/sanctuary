import type {
  HabitFrequency,
  HabitCategory,
  HabitPriority,
  HabitStatus,
} from '#/types/index'

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
    daysOfWeek: string | null
    priority: HabitPriority
    category: HabitCategory
    status: HabitStatus
    intention: string | null
    currentStreak: number
    longestStreak: number
    createdAt: Date
  }>,
) => ({
  name: 'Test Habit',
  frequency: 'every_day' as HabitFrequency,
  daysOfWeek: null as string | null,
  priority: 'medium' as HabitPriority,
  category: 'mind' as HabitCategory,
  status: 'active' as HabitStatus,
  intention: null as string | null,
  currentStreak: 0,
  longestStreak: 0,
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
    firstName: string | null
    onboardedAt: Date | null
    disclaimerAgreed: boolean
    privacyPin: string | null
    showPromptInspire: boolean
    showBreathingSpace: boolean
    showHabits: boolean
    showDailyIntention: boolean
  }>,
) => ({
  firstName: 'Test User',
  onboardedAt: new Date(),
  disclaimerAgreed: true,
  privacyPin: null as string | null,
  showPromptInspire: true,
  showBreathingSpace: true,
  showHabits: true,
  showDailyIntention: true,
  ...overrides,
})

export const createCustomPromptFixture = (
  overrides?: Partial<{ text: string; createdAt: Date }>,
) => ({
  text: 'What inspired you today?',
  createdAt: new Date(),
  ...overrides,
})

/** YYYY-MM-DD date string for habit completion tests. */
export const formatDate = (date: Date = new Date()): string =>
  date.toISOString().split('T')[0]
