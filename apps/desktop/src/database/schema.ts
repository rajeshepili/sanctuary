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
}, (t) => ({
  entryIdIndex: index('entry_id_idx').on(t.entryId),
}))

export const habits = sqliteTable('habits', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  identityLabel: text('identity_label'),
  miniDesc: text('mini_desc'),
  plusDesc: text('plus_desc'),
  eliteDesc: text('elite_desc'),
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
    completedAt: text('completed_at').notNull(),
    tier: text({ enum: ['mini', 'plus', 'elite', 'skipped'] })
      .notNull()
      .default('plus'),
  },
  (t) => ({
    uniqueCompletion: unique().on(t.habitId, t.completedAt),
    completedAtIndex: index('completed_at_idx').on(t.completedAt),
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
  latitude: real('latitude'),
  longitude: real('longitude'),
  locationLabel: text('location_label'),
  syncDirectory: text('sync_directory'),
  syncPassphraseHash: text('sync_passphrase_hash'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
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
