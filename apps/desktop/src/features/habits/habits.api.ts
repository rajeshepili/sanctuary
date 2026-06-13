import { createServerFn } from '@tanstack/react-start'
import {
  createHabitSchema,
  updateHabitStatusSchema,
  deleteHabitSchema,
  toggleCompletionSchema,
} from './habits.schema'
import {
  getAllHabitsService,
  createHabitService,
  updateHabitStatusService,
  deleteHabitService,
  toggleHabitCompletionService,
  reactivateHabits,
} from './habits.service'
import { getDb } from '#/database'

export const getAllHabits = createServerFn({ method: 'GET' }).handler(() =>
  getAllHabitsService(),
)

export const syncHabits = createServerFn({ method: 'POST' }).handler(async () => {
  const db = await getDb()
  await reactivateHabits(db)
})

export const createHabit = createServerFn({ method: 'POST' })
  .inputValidator(createHabitSchema)
  .handler(({ data }) => createHabitService(data))

export const updateHabitStatus = createServerFn({ method: 'POST' })
  .inputValidator(updateHabitStatusSchema)
  .handler(({ data }) => updateHabitStatusService(data))

export const deleteHabit = createServerFn({ method: 'POST' })
  .inputValidator(deleteHabitSchema)
  .handler(({ data }) => deleteHabitService(data))

export const toggleHabitCompletion = createServerFn({ method: 'POST' })
  .inputValidator(toggleCompletionSchema)
  .handler(({ data }) => toggleHabitCompletionService(data))
