import { getDb } from '#/database'
import { userPreferences } from '#/database/schema'
import { eq } from 'drizzle-orm'
import { PreferencesError } from './preferences.errors'
import type { UserPreferences } from '#/types'
import { getFirstOrThrow } from '#/database/utils'

export async function getPreferencesService(): Promise<UserPreferences> {
  const db = await getDb()
  const results = await db.select().from(userPreferences).limit(1)

  return getFirstOrThrow(
    results,
    new PreferencesError(
      'PREFERENCES_NOT_FOUND',
      'User preferences not found. The database may not have seeded correctly.',
      { status: 404 },
    ),
  )
}

export async function updatePreferencesService(
  data: Partial<typeof userPreferences.$inferInsert>,
): Promise<UserPreferences> {
  const db = await getDb()

  const [current] = await db
    .select({ onboardedAt: userPreferences.onboardedAt })
    .from(userPreferences)
    .where(eq(userPreferences.id, 1))
    .limit(1)

  if (!current) {
    throw new PreferencesError(
      'PREFERENCES_NOT_FOUND',
      'User preferences not found. The database may not have seeded correctly.',
      { status: 404 },
    )
  }

  const payload: Partial<typeof userPreferences.$inferInsert> = { ...data }

  // onboardedAt is immutable once set — stamp it only on first disclaimer agreement.
  if (data.disclaimerAgreed && !current.onboardedAt) {
    payload.onboardedAt = new Date()
  }

  const [updated] = await db
    .update(userPreferences)
    .set(payload)
    .where(eq(userPreferences.id, 1))
    .returning()

  if (!updated) {
    throw new PreferencesError('PREFERENCES_UPDATE_FAILED', 'Failed to update preferences')
  }

  return updated
}
