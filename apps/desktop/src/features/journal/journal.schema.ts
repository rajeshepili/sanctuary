import z from 'zod'

export const mediaItemSchema = z.object({
  base64Data: z.string().min(1),
})

export const createEntrySchema = z.object({
  content: z.string().min(1, 'Content is required'),
  media: z.array(mediaItemSchema).default([]),
})

export const updateEntrySchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1, 'Content is required'),
  addedMedia: z.array(mediaItemSchema).default([]),
  removedMediaIds: z.array(z.number().int()).default([]),
})

export const deleteEntrySchema = z.object({
  id: z.number().int().positive(),
})

export const getEntrySchema = z.object({
  id: z.number().int().positive(),
})

export const togglePinSchema = z.object({
  id: z.number().int().positive(),
})

export const listEntriesSchema = z.object({
  cursor: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).default(50),
})

export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>
export type DeleteEntryInput = z.infer<typeof deleteEntrySchema>
export type TogglePinInput = z.infer<typeof togglePinSchema>
export type GetEntryInput = z.infer<typeof getEntrySchema>
export type ListEntriesInput = z.infer<typeof listEntriesSchema>
