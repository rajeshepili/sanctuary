import { createServerFn } from '@tanstack/react-start'
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './categories.schema'

export const getAllCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findAll } = await import('./categories.repository')
    return findAll()
  },
)

export const createCategory = createServerFn({ method: 'POST' })
  .validator(createCategorySchema)
  .handler(async ({ data }) => {
    const { create } = await import('./categories.repository')
    return create(data)
  })

export const updateCategory = createServerFn({ method: 'POST' })
  .validator(updateCategorySchema)
  .handler(async ({ data }) => {
    const { update } = await import('./categories.repository')
    return update(data)
  })

export const deleteCategory = createServerFn({ method: 'POST' })
  .validator(deleteCategorySchema)
  .handler(async ({ data }) => {
    const { remove } = await import('./categories.repository')
    return remove(data)
  })
