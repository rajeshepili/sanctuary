/**
 * seed.ts — Centralized first-boot database initialization.
 *
 * This module is responsible for inserting the default row(s) for every
 * feature that requires a singleton record (e.g. user_preferences).
 * It must be called once at server startup before any service reads the DB.
 *
 * Rules:
 *  - Each block uses INSERT OR IGNORE (via Drizzle's `onConflictDoNothing`)
 *    so re-running is always safe and idempotent.
 *  - No business logic lives here — only structural defaults.
 *  - Feature services must NOT contain fallback insert logic of their own.
 *
 * NOTE: `db` is passed in as a parameter (not imported) to avoid a circular
 * dependency with database/index.ts.
 */

import type { Database } from '#/database'
import { userPreferences, habitCategories } from './schema'

export async function seedDatabase(db: Database): Promise<void> {
  // 1. Preferences Singleton
  await db
    .insert(userPreferences)
    .values({
      id: 1,
      name: null,
      onboardedAt: null,
      disclaimerAgreed: false,
    })
    .onConflictDoNothing({ target: userPreferences.id })

  // 2. Default Habit Categories
  const defaultCategories = [
    { id: 1, name: 'Health' },
    { id: 2, name: 'Productivity' },
    { id: 3, name: 'Mindfulness' },
    { id: 4, name: 'Learning' },
    { id: 5, name: 'Creativity' },
    { id: 6, name: 'Financial' },
  ]

  for (const cat of defaultCategories) {
    await db
      .insert(habitCategories)
      .values(cat)
      .onConflictDoNothing({ target: habitCategories.id })
  }
}
