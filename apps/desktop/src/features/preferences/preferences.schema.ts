import z from 'zod'

export const updatePreferencesSchema = z.object({
  name: z.string().optional(),
  /** @deprecated use `name` */
  firstName: z.string().optional(),
  disclaimerAgreed: z.boolean().optional(),
  privacyPin: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  locationLabel: z.string().nullable().optional(),
  syncDirectory: z.string().nullable().optional(),
  syncPassphraseHash: z.string().nullable().optional(),
  lastSyncedAt: z.date().nullable().optional(),
  backupEnabled: z.boolean().optional(),
  backupPath: z.string().nullable().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'manual']).optional(),
  lastBackupAt: z.date().nullable().optional(),
  backupKeepCount: z.number().int().min(1).max(365).optional(),
  layoutMode: z.enum(['standard', 'immersive']).optional(),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
