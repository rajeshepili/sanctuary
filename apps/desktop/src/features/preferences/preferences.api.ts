import { createServerFn } from '@tanstack/react-start'
import { updatePreferencesSchema } from './preferences.schema'

export const getPreferences = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getPreferencesService } = await import('./preferences.repository')
    return getPreferencesService()
  },
)

export const updatePreferences = createServerFn({ method: 'POST' })
  .validator(updatePreferencesSchema)
  .handler(async ({ data }) => {
    const { updatePreferencesService } =
      await import('./preferences.repository')
    return updatePreferencesService(data)
  })
