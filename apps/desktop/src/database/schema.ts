import {
  sqliteTable,
  integer,
  text,
  unique,
  real,
  index,
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

export const journalEntries = sqliteTable('journal_entries', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  tags: text(),
  isPinned: integer({ mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (t) => ({
  deletedAtIndex: index('deleted_at_idx').on(t.deletedAt),
  pinnedIndex: index('pinned_idx').on(t.isPinned),
  createdAtIndex: index('created_at_idx').on(t.createdAt),
}))

export const entryMedia = sqliteTable('entry_media', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id')
    .notNull()
    .references(() => journalEntries.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  thumbnailPath: text('thumbnail_path').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const habits = sqliteTable('habits', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  identityLabel: text('identity_label'), // e.g. "I am a runner"
  miniDesc: text('mini_desc'), // The "floor" requirement
  plusDesc: text('plus_desc'), // The "standard" requirement
  eliteDesc: text('elite_desc'), // The "ceiling" requirement
  frequency: text({ enum: ['every_day', 'weekdays', 'weekends', 'custom'] })
    .notNull()
    .default('every_day'),
  daysOfWeek: text('days_of_week'),
  priority: text({ enum: ['easy', 'medium', 'hard'] })
    .notNull()
    .default('medium'),
  category: text({ enum: ['mind', 'body', 'connection', 'rest', 'growth'] })
    .notNull()
    .default('growth'),
  status: text({ enum: ['active', 'resting'] })
    .notNull()
    .default('active'),
  restUntil: integer('rest_until', { mode: 'timestamp' }),
  intention: text(),
  // Streaks are deprecated in favor of rolling consistency and identity strength
  // currentStreak: integer('current_streak').notNull().default(0),
  // longestStreak: integer('longest_streak').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const habitCompletions = sqliteTable(
  'habit_completions',
  {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    completedAt: text('completed_at').notNull(), // 'YYYY-MM-DD'
    tier: text({ enum: ['mini', 'plus', 'elite'] })
      .notNull()
      .default('plus'),
  },
  (t) => ({
    uniqueCompletion: unique().on(t.habitId, t.completedAt),
  }),
)

export const userPreferences = sqliteTable('user_preferences', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  firstName: text('first_name'),
  onboardedAt: integer('onboarded_at', { mode: 'timestamp' }),
  disclaimerAgreed: integer({ mode: 'boolean' }).notNull().default(false),
  showPromptInspire: integer({ mode: 'boolean' }).notNull().default(true),
  showBreathingSpace: integer({ mode: 'boolean' }).notNull().default(true),
  showHabits: integer({ mode: 'boolean' }).notNull().default(true),
  showDailyIntention: integer({ mode: 'boolean' }).notNull().default(true),
  privacyPin: text('privacy_pin'),
  // Location for astronomical scene timing (suncalc)
  latitude: real('latitude'),
  longitude: real('longitude'),
  locationLabel: text('location_label'), // e.g. "Berlin, Germany"
})

export const customPrompts = sqliteTable('custom_prompts', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const journalEntriesRelations = relations(
  journalEntries,
  ({ many }) => ({
    media: many(entryMedia),
  }),
)

export const entryMediaRelations = relations(entryMedia, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [entryMedia.entryId],
    references: [journalEntries.id],
  }),
}))

export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}))

export const habitCompletionsRelations = relations(
  habitCompletions,
  ({ one }) => ({
    habit: one(habits, {
      fields: [habitCompletions.habitId],
      references: [habits.id],
    }),
  }),
)
