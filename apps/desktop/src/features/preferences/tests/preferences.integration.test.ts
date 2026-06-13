import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import * as schema from '#/database/schema'
import { createTestDatabase, resetTestDatabase } from '#/test/database'
import { seedPreferences } from '#/test/db-seed'

describe('Preferences Integration Tests', () => {
  let db: LibSQLDatabase<typeof schema>

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates default preferences', async () => {
    const created = await seedPreferences(db, {
      firstName: 'Test User',
      disclaimerAgreed: true,
    })

    const retrieved = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(retrieved?.firstName).toBe('Test User')
    expect(retrieved?.disclaimerAgreed).toBe(true)
  })

  it('updates preferences', async () => {
    const created = await seedPreferences(db, { firstName: 'Initial Name' })

    await db
      .update(schema.userPreferences)
      .set({
        firstName: 'Updated Name',
        showHabits: false,
        showPromptInspire: false,
      })
      .where(eq(schema.userPreferences.id, created.id))

    const updated = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(updated?.firstName).toBe('Updated Name')
    expect(updated?.showHabits).toBe(false)
    expect(updated?.showPromptInspire).toBe(false)
  })

  it('handles optional fields', async () => {
    const created = await seedPreferences(db, {
      firstName: null,
      privacyPin: null,
    })

    const retrieved = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(retrieved?.firstName).toBeNull()
    expect(retrieved?.privacyPin).toBeNull()
  })

  it('updates onboarding status', async () => {
    const created = await seedPreferences(db, {
      disclaimerAgreed: false,
      onboardedAt: null,
    })

    const now = new Date()
    await db
      .update(schema.userPreferences)
      .set({
        disclaimerAgreed: true,
        onboardedAt: now,
      })
      .where(eq(schema.userPreferences.id, created.id))

    const updated = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(updated?.disclaimerAgreed).toBe(true)
    expect(Math.floor((updated?.onboardedAt?.getTime() ?? 0) / 1000)).toBe(
      Math.floor(now.getTime() / 1000),
    )
  })

  it('toggles feature flags', async () => {
    const created = await seedPreferences(db)

    await db
      .update(schema.userPreferences)
      .set({
        showHabits: false,
        showPromptInspire: false,
        showBreathingSpace: false,
      })
      .where(eq(schema.userPreferences.id, created.id))

    const updated = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(updated?.showHabits).toBe(false)
    expect(updated?.showPromptInspire).toBe(false)
    expect(updated?.showBreathingSpace).toBe(false)
  })

  it('stores privacy PIN', async () => {
    const created = await seedPreferences(db, { privacyPin: '1234' })

    const retrieved = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(retrieved?.privacyPin).toBe('1234')
  })
})
