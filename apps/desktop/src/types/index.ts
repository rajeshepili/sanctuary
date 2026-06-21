import type {
  journalEntries,
  entryMedia,
  habits,
  habitCompletions,
  habitCategories,
  userPreferences,
} from '#/database/schema'

// ─── Inferred Enums (From DB Schema) ─────────────────────────────────────────

export type ThemeMood = 'morning' | 'day' | 'evening' | 'night'
export type JournalMood = NonNullable<(typeof journalEntries.$inferSelect)['mood']>
export type HabitCategory = typeof habitCategories.$inferSelect
export type HabitFrequency = (typeof habits.$inferSelect)['frequency']
export type HabitPriority = (typeof habits.$inferSelect)['priority']
export type HabitStatus = (typeof habits.$inferSelect)['status']
export type HabitTier = (typeof habitCompletions.$inferSelect)['tier']

// ─── UI Entity Types (Directly from Schema) ──────────────────────────────────

// Habits
export type Habit = typeof habits.$inferSelect
export type HabitCompletion = typeof habitCompletions.$inferSelect
export type HabitCategoryEntity = typeof habitCategories.$inferSelect

export type HabitsData = {
  habits: Habit[]
  completions: HabitCompletion[]
}

// Journal
export type EntryMedia = typeof entryMedia.$inferSelect

export type Entry = typeof journalEntries.$inferSelect & {
  media: EntryMedia[]
}

// Preferences
export type UserPreferences = typeof userPreferences.$inferSelect
