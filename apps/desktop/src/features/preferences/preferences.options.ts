import { queryOptions } from '@tanstack/react-query'
import { preferencesKeys } from './preferences.keys'
import { getPreferences } from './preferences.api'
import { withTimeout } from '#/lib/with-timeout'

export const preferencesQueryOptions = () =>
  queryOptions({
    queryKey: preferencesKeys.all,
    queryFn: () =>
      withTimeout(() => getPreferences(), { name: 'getPreferences' }),
  })
