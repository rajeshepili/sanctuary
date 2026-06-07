import z from 'zod'

export const uploadMediaSchema = z.object({
  entryId: z.number(),
  base64Data: z.string(),
})

export const getMediaSchema = z.object({
  mediaId: z.number(),
  thumbnailOnly: z.boolean().optional().default(false),
})

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
export type GetMediaInput = z.infer<typeof getMediaSchema>
