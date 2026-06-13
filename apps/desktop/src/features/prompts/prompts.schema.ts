import z from 'zod'

export const addPromptSchema = z.object({
  text: z.string().min(1, 'Prompt text is required'),
})

export const updatePromptSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1, 'Prompt text is required'),
})

export const deletePromptSchema = z.object({
  id: z.number().int().positive(),
})

export type AddPromptInput = z.infer<typeof addPromptSchema>
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>
export type DeletePromptInput = z.infer<typeof deletePromptSchema>
