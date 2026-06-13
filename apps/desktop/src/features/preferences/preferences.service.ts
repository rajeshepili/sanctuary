import { getDb } from '#/database'
import { userPreferences } from '#/database/schema'
import { eq } from 'drizzle-orm'
import { PreferencesError } from './preferences.errors'
import type { UserPreferences } from '#/types'

export async function getPreferencesService(): Promise<UserPreferences> {
  const db = await getDb()
  const results = await db.select().from(userPreferences).limit(1)

  const prefs = results[0]

  if (!prefs) {
    throw new PreferencesError(
      'PREFERENCES_NOT_FOUND',
      'User preferences not found. The database may not have seeded correctly.',
      { status: 404 }
    )
  }

  return prefs
}

export async function updatePreferencesService(
  data: Partial<typeof userPreferences.$inferInsert>,
): Promise<UserPreferences> {
  const db = await getDb()
  const results = await db.select().from(userPreferences).limit(1)
  const existing = results[0]

  if (!existing) {
    throw new PreferencesError(
      'PREFERENCES_NOT_FOUND',
      'User preferences not found. The database may not have seeded correctly.',
      { status: 404 }
    )
  }

  const updateData: Partial<typeof userPreferences.$inferInsert> = { ...data }

  /** Immutable field: set onboardedAt exactly once upon initial disclaimer agreement. */
  if (data.disclaimerAgreed && !existing.onboardedAt) {
    updateData.onboardedAt = new Date()
  }

  const updatedResults = await db
    .update(userPreferences)
    .set(updateData)
    .where(eq(userPreferences.id, existing.id))
    .returning()

  const updated = updatedResults[0]

  if (!updated) {
    throw new PreferencesError('PREFERENCES_UPDATE_FAILED', 'Failed to update preferences')
  }

  return updated
}
