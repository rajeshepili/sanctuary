import z from 'zod'

export const habitFrequencySchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'custom',
])
export const habitPrioritySchema = z.enum(['low', 'medium', 'high'])
export const habitStatusSchema = z.enum(['active', 'resting'])

export const habitTierSchema = z.enum(['mini', 'plus', 'elite', 'skipped'])

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  identityLabel: z.string().nullable().optional(),
  miniDesc: z.string().nullable().optional(),
  plusDesc: z.string().nullable().optional(),
  eliteDesc: z.string().nullable().optional(),
  frequency: habitFrequencySchema.default('daily'),
  interval: z.number().int().min(1).default(1),
  daysOfWeek: z.array(z.number()).nullable().optional(),
  priority: habitPrioritySchema.default('medium'),
  categoryId: z.number().int().positive().nullable().optional(),
  intention: z.string().nullable().optional(),
})

export const updateHabitSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required'),
  identityLabel: z.string().nullable().optional(),
  miniDesc: z.string().nullable().optional(),
  plusDesc: z.string().nullable().optional(),
  eliteDesc: z.string().nullable().optional(),
  frequency: habitFrequencySchema,
  interval: z.number().int().min(1),
  daysOfWeek: z.array(z.number()).nullable().optional(),
  priority: habitPrioritySchema,
  categoryId: z.number().int().positive().nullable().optional(),
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

export type CreateHabitInput = z.input<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type UpdateHabitStatusInput = z.infer<typeof updateHabitStatusSchema>
export type DeleteHabitInput = z.infer<typeof deleteHabitSchema>
export type ToggleCompletionInput = z.infer<typeof toggleCompletionSchema>