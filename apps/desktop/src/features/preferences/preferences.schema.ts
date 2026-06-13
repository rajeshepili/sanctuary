import z from 'zod'

export const updatePreferencesSchema = z.object({
  firstName: z.string().optional(),
  disclaimerAgreed: z.boolean().optional(),
  showPromptInspire: z.boolean().optional(),
  showBreathingSpace: z.boolean().optional(),
  showHabits: z.boolean().optional(),
  showDailyIntention: z.boolean().optional(),
  privacyPin: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  locationLabel: z.string().nullable().optional(),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
