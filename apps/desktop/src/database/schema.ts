import {
  sqliteTable,
  integer,
  text,
  unique,
  real,
  index,
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// SQLite schema. After modifying, run: pnpm db:generate && pnpm db:migrate
// Note: Drizzle ORM requires mapping boolean and timestamp columns to `integer`.
export const journalEntries = sqliteTable(
  'journal_entries',
  {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    content: text().notNull(),
    tags: text(),
    isPinned: integer({ mode: 'boolean' }).notNull().default(false),
    mood: text({
      enum: [
        'happy',
        'calm',
        'focused',
        'anxious',
        'sad',
        'energetic',
        'tired',
      ],
    }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (t) => [
    index('deleted_at_idx').on(t.deletedAt),
    index('pinned_idx').on(t.isPinned),
    index('created_at_idx').on(t.createdAt),
  ],
)

export const entryMedia = sqliteTable(
  'entry_media',
  {
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
  },
  (t) => [index('entry_id_idx').on(t.entryId)],
)

export const habits = sqliteTable('habits', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  identityLabel: text('identity_label'),
  miniDesc: text('mini_desc'),
  plusDesc: text('plus_desc'),
  eliteDesc: text('elite_desc'),
  frequency: text({ enum: ['daily', 'weekly', 'monthly', 'custom'] })
    .notNull()
    .default('daily'),
  interval: integer('interval').notNull().default(1),
  daysOfWeek: text('days_of_week', { mode: 'json' }).$type<number[]>(),
  targetCount: integer('target_count'),
  priority: text({ enum: ['low', 'medium', 'high'] })
    .notNull()
    .default('medium'),
  categoryId: integer('category_id').references(() => habitCategories.id, {
    onDelete: 'set null',
  }),
  status: text({ enum: ['active', 'resting'] })
    .notNull()
    .default('active'),
  restUntil: integer('rest_until', { mode: 'timestamp' }),
  intention: text(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const habitCategories = sqliteTable('habit_categories', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
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
  (t) => [
    unique().on(t.habitId, t.completedAt),
    index('completed_at_idx').on(t.completedAt),
  ],
)

export const userPreferences = sqliteTable('user_preferences', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name'),
  onboardedAt: integer('onboarded_at', { mode: 'timestamp' }),
  disclaimerAgreed: integer({ mode: 'boolean' }).notNull().default(false),
  privacyPin: text('privacy_pin'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  locationLabel: text('location_label'),
  syncDirectory: text('sync_directory'),
  syncPassphraseHash: text('sync_passphrase_hash'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  // Backup configuration — set during onboarding, adjustable in Settings.
  backupEnabled: integer('backup_enabled', { mode: 'boolean' })
    .notNull()
    .default(true),
  backupPath: text('backup_path'),
  backupFrequency: text('backup_frequency', {
    enum: ['daily', 'weekly', 'manual'],
  })
    .notNull()
    .default('daily'),
  lastBackupAt: integer('last_backup_at', { mode: 'timestamp' }),
  backupKeepCount: integer('backup_keep_count').notNull().default(30),
  layoutMode: text('layout_mode', { enum: ['standard', 'immersive'] })
    .notNull()
    .default('standard'),
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

export const habitCategoriesRelations = relations(
  habitCategories,
  ({ many }) => ({
    habits: many(habits),
  }),
)
