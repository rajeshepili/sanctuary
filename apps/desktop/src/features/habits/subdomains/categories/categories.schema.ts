import z from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
})

export const updateCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
})

export const deleteCategorySchema = z.object({
  id: z.number().int().positive(),
})

export type CreateCategoryInput = z.input<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>
