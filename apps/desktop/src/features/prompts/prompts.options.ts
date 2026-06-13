import { queryOptions } from '@tanstack/react-query'
import { promptsKeys } from './prompts.keys'
import { getPrompts } from './prompts.api'
import { withTimeout } from '#/lib/with-timeout'

export const promptsQueryOptions = () =>
  queryOptions({
    queryKey: promptsKeys.all,
    queryFn: () => withTimeout(() => getPrompts(), { name: 'getPrompts' }),
  })
