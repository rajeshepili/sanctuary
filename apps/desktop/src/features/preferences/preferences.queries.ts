import { useSuspenseQuery } from '@tanstack/react-query'
import { preferencesQueryOptions } from './preferences.options'

export function usePreferencesQueries() {
  const { data: prefs } = useSuspenseQuery(preferencesQueryOptions())
  return { prefs }
}
