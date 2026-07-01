import type { QueryClient } from '@tanstack/react-query'
import type { HabitCategoryEntity } from '#/types'
import { categoriesKeys } from './categories.keys'

export const categoriesCache = {
  get: (queryClient: QueryClient): HabitCategoryEntity[] => {
    return queryClient.getQueryData<HabitCategoryEntity[]>(categoriesKeys.all) ?? []
  },

  set: (queryClient: QueryClient, data: HabitCategoryEntity[]) => {
    queryClient.setQueryData(categoriesKeys.all, data)
  },

  insert: (queryClient: QueryClient, newCategory: HabitCategoryEntity) => {
    queryClient.setQueryData<HabitCategoryEntity[]>(
      categoriesKeys.all,
      (old) => [...(old ?? []), newCategory],
    )
  },

  patch: (queryClient: QueryClient, updatedCategory: HabitCategoryEntity) => {
    queryClient.setQueryData<HabitCategoryEntity[]>(
      categoriesKeys.all,
      (old) =>
        old?.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)) ?? [],
    )
  },

  remove: (queryClient: QueryClient, id: number) => {
    queryClient.setQueryData<HabitCategoryEntity[]>(
      categoriesKeys.all,
      (old) => old?.filter((cat) => cat.id !== id) ?? [],
    )
  },
}
