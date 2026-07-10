import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { journalKeys } from './journal.keys'
import {
  getAllEntries,
  getDeletedEntries,
  getEntry,
  listEntries,
} from './journal.api'
import { withTimeout } from '#/lib/with-timeout'
import type { Entry } from '#/types'

interface InfiniteEntriesData {
  items: Entry[]
  nextCursor: number | null
}

export const entriesQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.entries,
    queryFn: () =>
      withTimeout(() => getAllEntries(), { name: 'getAllEntries' }),
  })

export const infiniteEntriesQueryOptions = () =>
  infiniteQueryOptions<
    InfiniteEntriesData,
    Error,
    InfiniteData<InfiniteEntriesData, number | undefined>,
    string[],
    number | undefined
  >({
    queryKey: [...journalKeys.entries, 'infinite'],
    queryFn: ({ pageParam }) =>
      withTimeout(
        () => listEntries({ data: { cursor: pageParam, limit: 50 } }),
        { name: 'listEntries' },
      ),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

export const getEntryQueryOptions = (data: { id: number }) =>
  queryOptions({
    queryKey: [...journalKeys.entries, data.id, data],
    queryFn: () => withTimeout(() => getEntry({ data }), { name: 'getEntry' }),
  })

export const trashQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.trash,
    queryFn: () =>
      withTimeout(() => getDeletedEntries(), { name: 'getDeletedEntries' }),
  })
