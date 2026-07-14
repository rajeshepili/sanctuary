import { createServerFn } from '@tanstack/react-start'
import { updatePreferencesSchema } from './preferences.schema'
import {
  getPreferencesService,
  updatePreferencesService,
} from './preferences.repository'

export const getPreferences = createServerFn({ method: 'GET' }).handler(() =>
  getPreferencesService(),
)

export const updatePreferences = createServerFn({ method: 'POST' })
  .validator(updatePreferencesSchema)
  .handler(({ data }) => updatePreferencesService(data))
