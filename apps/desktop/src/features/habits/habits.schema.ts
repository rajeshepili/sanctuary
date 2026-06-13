import z from 'zod'

export const habitFrequencySchema = z.enum([
  'every_day',
  'weekdays',
  'weekends',
  'custom',
])
export const habitPrioritySchema = z.enum(['easy', 'medium', 'hard'])
export const habitCategorySchema = z.enum([
  'mind',
  'body',
  'connection',
  'rest',
  'growth',
])
export const habitStatusSchema = z.enum(['active', 'resting'])

export const habitTierSchema = z.enum(['mini', 'plus', 'elite'])

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  identityLabel: z.string().nullable().optional(),
  miniDesc: z.string().nullable().optional(),
  plusDesc: z.string().nullable().optional(),
  eliteDesc: z.string().nullable().optional(),
  frequency: habitFrequencySchema.default('every_day'),
  daysOfWeek: z.string().nullable().optional(),
  priority: habitPrioritySchema.default('medium'),
  category: habitCategorySchema.default('growth'),
  intention: z.string().nullable().optional(),
})

export const updateHabitStatusSchema = z.object({
  id: z.number().int().positive(),
  status: habitStatusSchema,
  restUntil: z.date().nullable().optional(),
})

export const deleteHabitSchema = z.object({
  id: z.number().int().positive(),
})

export const toggleCompletionSchema = z.object({
  habitId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  tier: habitTierSchema.optional(),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitStatusInput = z.infer<typeof updateHabitStatusSchema>
export type DeleteHabitInput = z.infer<typeof deleteHabitSchema>
export type ToggleCompletionInput = z.infer<typeof toggleCompletionSchema>
