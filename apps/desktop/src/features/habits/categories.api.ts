import { createServerFn } from '@tanstack/react-start'
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './categories.schema'
import {
  getAllCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from './categories.service'

export const getAllCategories = createServerFn({ method: 'GET' }).handler(() =>
  getAllCategoriesService(),
)

export const createCategory = createServerFn({ method: 'POST' })
  .validator(createCategorySchema)
  .handler(({ data }) => createCategoryService(data))

export const updateCategory = createServerFn({ method: 'POST' })
  .validator(updateCategorySchema)
  .handler(({ data }) => updateCategoryService(data))

export const deleteCategory = createServerFn({ method: 'POST' })
  .validator(deleteCategorySchema)
  .handler(({ data }) => deleteCategoryService(data))
