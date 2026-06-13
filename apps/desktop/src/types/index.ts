import type {
  journalEntries,
  entryMedia,
  habits,
  habitCompletions,
  customPrompts,
  userPreferences,
} from '#/database/schema'

// ─── Type Helpers ────────────────────────────────────────────────────────────

// ─── Inferred Enums (From DB Schema) ─────────────────────────────────────────

export type ThemeMood = 'morning' | 'day' | 'evening' | 'night'
export type HabitFrequency = (typeof habits.$inferSelect)['frequency']
export type HabitPriority = (typeof habits.$inferSelect)['priority']
export type HabitCategory = (typeof habits.$inferSelect)['category']
export type HabitStatus = (typeof habits.$inferSelect)['status']

// ─── UI Entity Types (Directly from Schema) ──────────────────────────────────

// Habits
export type Habit = typeof habits.$inferSelect
export type HabitCompletion = typeof habitCompletions.$inferSelect

export type HabitsData = {
  habits: Habit[]
  completions: HabitCompletion[]
}

// Journal
export type EntryMedia = typeof entryMedia.$inferSelect

export type Entry = typeof journalEntries.$inferSelect & {
  media: EntryMedia[]
}

// Prompts
export type CustomPrompt = typeof customPrompts.$inferSelect

// Preferences
export type UserPreferences = typeof userPreferences.$inferSelect
