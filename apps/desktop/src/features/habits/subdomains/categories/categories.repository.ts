import { getDb } from '#/database'
import { habitCategories } from '#/database/schema'
import { eq } from 'drizzle-orm'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
} from './categories.schema'
import type { HabitCategoryEntity } from '#/types'
import { getFirstOrThrow, ensureRowsAffected } from '#/database/utils'
import { CategoryError } from './categories.errors'

export async function findAll(): Promise<HabitCategoryEntity[]> {
  const db = await getDb()
  return db.select().from(habitCategories)
}

export async function create(
  data: CreateCategoryInput,
): Promise<HabitCategoryEntity> {
  const db = await getDb()
  const results = await db
    .insert(habitCategories)
    .values({ name: data.name.trim() })
    .returning()

  return getFirstOrThrow(
    results,
    new CategoryError('CATEGORY_CREATE_FAILED', 'Failed to create category'),
  )
}

export async function update(
  data: UpdateCategoryInput,
): Promise<HabitCategoryEntity> {
  const db = await getDb()
  const results = await db
    .update(habitCategories)
    .set({ name: data.name.trim() })
    .where(eq(habitCategories.id, data.id))
    .returning()

  return getFirstOrThrow(
    results,
    new CategoryError('CATEGORY_UPDATE_FAILED', 'Failed to update category'),
  )
}

export async function remove(data: DeleteCategoryInput): Promise<void> {
  const db = await getDb()
  const results = await db
    .delete(habitCategories)
    .where(eq(habitCategories.id, data.id))
    .returning()

  ensureRowsAffected(
    results,
    new CategoryError('CATEGORY_DELETE_FAILED', 'Failed to delete category'),
  )
}
