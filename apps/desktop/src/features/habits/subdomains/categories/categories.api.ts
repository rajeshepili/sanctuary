import { createServerFn } from '@tanstack/react-start'
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './categories.schema'
import { findAll, create, update, remove } from './categories.repository'

export const getAllCategories = createServerFn({ method: 'GET' }).handler(() =>
  findAll(),
)

export const createCategory = createServerFn({ method: 'POST' })
  .validator(createCategorySchema)
  .handler(({ data }) => create(data))

export const updateCategory = createServerFn({ method: 'POST' })
  .validator(updateCategorySchema)
  .handler(({ data }) => update(data))

export const deleteCategory = createServerFn({ method: 'POST' })
  .validator(deleteCategorySchema)
  .handler(({ data }) => remove(data))
