import { queryOptions } from '@tanstack/react-query'
import { habitsKeys } from './habits.keys'
import { getAllHabits } from './habits.api'
import { withTimeout } from '#/lib/with-timeout'

export const habitsQueryOptions = () =>
  queryOptions({
    queryKey: habitsKeys.all,
    queryFn: () => withTimeout(() => getAllHabits(), { name: 'getAllHabits' }),
  })
