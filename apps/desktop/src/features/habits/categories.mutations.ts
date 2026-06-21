import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoriesCache } from './categories.cache'
import {
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
} from './categories.api'
import { parseError } from '#/lib/error-parser'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.schema'

export function useCategoryMutations() {
  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategoryApi({ data }),
    onSuccess: (category) => {
      categoriesCache.insert(queryClient, category)
      toast.success('Category created.')
    },
    onError: (err) => {
      toast.error(`Could not create category — ${parseError(err).message}`)
    },
  })

  const updateCategory = useMutation({
    mutationFn: (data: UpdateCategoryInput) => updateCategoryApi({ data }),
    onSuccess: (category) => {
      categoriesCache.update(queryClient, category)
      toast.success('Category updated.')
    },
    onError: (err) => {
      toast.error(`Could not update category — ${parseError(err).message}`)
    },
  })

  const deleteCategory = useMutation({
    mutationFn: (id: number) => deleteCategoryApi({ data: { id } }),
    onSuccess: (_, id) => {
      categoriesCache.remove(queryClient, id)
      toast.success('Category deleted.')
    },
    onError: (err) => {
      toast.error(`Could not delete category — ${parseError(err).message}`)
    },
  })

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
