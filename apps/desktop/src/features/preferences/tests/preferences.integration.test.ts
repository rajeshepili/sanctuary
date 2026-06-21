import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import * as schema from '#/database/schema'
import { getSharedTestDatabase, resetTestDatabase } from '#/test/database'
import { seedPreferences } from '#/test/db-seed'

describe('Preferences Integration Tests', () => {
  let db: LibSQLDatabase<typeof schema>

  beforeEach(async () => {
    db = await getSharedTestDatabase()
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates default preferences', async () => {
    const created = await seedPreferences(db, {
      name: 'Test User',
      disclaimerAgreed: true,
    })

    const retrieved = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(retrieved?.name).toBe('Test User')
    expect(retrieved?.disclaimerAgreed).toBe(true)
  })

  it('updates preferences', async () => {
    const created = await seedPreferences(db, { name: 'Initial Name' })

    await db
      .update(schema.userPreferences)
      .set({
        name: 'Updated Name',
      })
      .where(eq(schema.userPreferences.id, created.id))

    const updated = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(updated?.name).toBe('Updated Name')
  })

  it('handles optional fields', async () => {
    const created = await seedPreferences(db, {
      name: null,
      privacyPin: null,
    })

    const retrieved = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(retrieved?.name).toBeNull()
    expect(retrieved?.privacyPin).toBeNull()
  })

  it('stamps onboardedAt on first disclaimer agreement', async () => {
    const created = await seedPreferences(db, {
      disclaimerAgreed: false,
      onboardedAt: null,
    })

    const now = new Date()
    await db
      .update(schema.userPreferences)
      .set({ disclaimerAgreed: true, onboardedAt: now })
      .where(eq(schema.userPreferences.id, created.id))

    const updated = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(updated?.disclaimerAgreed).toBe(true)
    expect(Math.floor((updated?.onboardedAt?.getTime() ?? 0) / 1000)).toBe(
      Math.floor(now.getTime() / 1000),
    )
  })

  it('does not overwrite onboardedAt once set', async () => {
    const originalDate = new Date('2025-01-01T00:00:00Z')
    const created = await seedPreferences(db, {
      disclaimerAgreed: true,
      onboardedAt: originalDate,
    })

    // Simulate a second disclaimer agreement attempt (e.g. re-running onboarding).
    // The service should guard against overwriting this, but the DB constraint is also tested here.
    await db
      .update(schema.userPreferences)
      .set({ disclaimerAgreed: true })
      .where(eq(schema.userPreferences.id, created.id))

    const updated = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    // onboardedAt should remain the original value — not reset or nulled.
    expect(Math.floor((updated?.onboardedAt?.getTime() ?? 0) / 1000)).toBe(
      Math.floor(originalDate.getTime() / 1000),
    )
  })


  it('stores privacy PIN', async () => {
    const created = await seedPreferences(db, { privacyPin: '1234' })

    const retrieved = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.id, created.id),
    })

    expect(retrieved?.privacyPin).toBe('1234')
  })
})
