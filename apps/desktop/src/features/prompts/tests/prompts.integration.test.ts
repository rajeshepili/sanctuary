import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { desc, eq, like } from 'drizzle-orm'
import * as schema from '#/database/schema'
import { createTestDatabase, resetTestDatabase } from '#/test/database'
import { seedPrompt } from '#/test/db-seed'

describe('Prompts Integration Tests', () => {
  let db: LibSQLDatabase<typeof schema>

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates and retrieves a custom prompt', async () => {
    const created = await seedPrompt(db, { text: 'What inspired you today?' })

    const retrieved = await db.query.customPrompts.findFirst({
      where: eq(schema.customPrompts.id, created.id),
    })

    expect(retrieved?.text).toBe('What inspired you today?')
  })

  it('lists all prompts', async () => {
    for (let i = 0; i < 5; i++) {
      await seedPrompt(db, { text: `Prompt ${i + 1}` })
    }

    const retrieved = await db.query.customPrompts.findMany()
    expect(retrieved).toHaveLength(5)
    expect(retrieved.map((p) => p.text)).toEqual(
      expect.arrayContaining([
        'Prompt 1',
        'Prompt 2',
        'Prompt 3',
        'Prompt 4',
        'Prompt 5',
      ]),
    )
  })

  it('updates a prompt', async () => {
    const created = await seedPrompt(db, { text: 'Original prompt' })

    await db
      .update(schema.customPrompts)
      .set({ text: 'Updated prompt' })
      .where(eq(schema.customPrompts.id, created.id))

    const updated = await db.query.customPrompts.findFirst({
      where: eq(schema.customPrompts.id, created.id),
    })

    expect(updated?.text).toBe('Updated prompt')
  })

  it('deletes a prompt', async () => {
    const created = await seedPrompt(db)

    await db
      .delete(schema.customPrompts)
      .where(eq(schema.customPrompts.id, created.id))

    const after = await db.query.customPrompts.findFirst({
      where: eq(schema.customPrompts.id, created.id),
    })

    expect(after).toBeUndefined()
  })

  it('orders prompts by creation date', async () => {
    await seedPrompt(db, {
      text: 'First prompt',
      createdAt: new Date('2024-01-01'),
    })
    await seedPrompt(db, {
      text: 'Second prompt',
      createdAt: new Date('2024-01-02'),
    })
    await seedPrompt(db, {
      text: 'Third prompt',
      createdAt: new Date('2024-01-03'),
    })

    const prompts = await db.query.customPrompts.findMany({
      orderBy: [desc(schema.customPrompts.createdAt)],
    })

    expect(prompts.map((p) => p.text)).toEqual([
      'Third prompt',
      'Second prompt',
      'First prompt',
    ])
  })

  it('filters prompts by text', async () => {
    await seedPrompt(db, { text: 'What inspired you today?' })
    await seedPrompt(db, { text: 'What are you grateful for?' })
    await seedPrompt(db, { text: 'What did you learn today?' })

    const prompts = await db.query.customPrompts.findMany({
      where: like(schema.customPrompts.text, '%inspired%'),
    })

    expect(prompts).toHaveLength(1)
    expect(prompts[0]?.text).toBe('What inspired you today?')
  })
})
