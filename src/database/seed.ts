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
import { userPreferences } from './schema'

export async function seedDatabase(db: Database): Promise<void> {
  await db
    .insert(userPreferences)
    .values({
      id: 1,
      firstName: null,
      onboardedAt: null,
      disclaimerAgreed: false,
      showPromptInspire: true,
      showBreathingSpace: true,
      showHabits: true,
      showDailyIntention: true,
    })
    .onConflictDoNothing({ target: userPreferences.id })
}
