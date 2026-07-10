import { queryOptions } from '@tanstack/react-query'
import { categoriesKeys } from './categories.keys'
import { getAllCategories } from './categories.api'

export const categoriesQueryOptions = queryOptions({
  queryKey: categoriesKeys.all,
  queryFn: () => getAllCategories(),
})
