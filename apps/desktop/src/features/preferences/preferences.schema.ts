import z from 'zod'

export const updatePreferencesSchema = z.object({
  firstName: z.string().optional(),
  disclaimerAgreed: z.boolean().optional(),
  privacyPin: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  locationLabel: z.string().nullable().optional(),
  syncDirectory: z.string().nullable().optional(),
  syncPassphraseHash: z.string().nullable().optional(),
  lastSyncedAt: z.date().nullable().optional(),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
