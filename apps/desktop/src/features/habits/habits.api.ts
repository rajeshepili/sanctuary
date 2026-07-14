import { createServerFn } from '@tanstack/react-start'
import {
  createHabitSchema,
  updateHabitSchema,
  updateHabitStatusSchema,
  deleteHabitSchema,
  toggleCompletionSchema,
} from './habits.schema'
import {
  findAll,
  create,
  update,
  updateStatus,
  remove,
  reactivateHabits,
} from './habits.repository'
import { toggleCompletion } from './completions.repository'

// ── Read ─────────────────────────────────────────────────────────────────────

export const getAllHabits = createServerFn({ method: 'GET' }).handler(() =>
  findAll(),
)

// ── Sync / Lifecycle ─────────────────────────────────────────────────────────

export const syncHabits = createServerFn({ method: 'POST' }).handler(() =>
  reactivateHabits(),
)

// ── Habit CRUD ───────────────────────────────────────────────────────────────

export const createHabit = createServerFn({ method: 'POST' })
  .validator(createHabitSchema)
  .handler(({ data }) => create(data))

export const updateHabit = createServerFn({ method: 'POST' })
  .validator(updateHabitSchema)
  .handler(({ data }) => update(data))

export const updateHabitStatus = createServerFn({ method: 'POST' })
  .validator(updateHabitStatusSchema)
  .handler(({ data }) => updateStatus(data))

export const deleteHabit = createServerFn({ method: 'POST' })
  .validator(deleteHabitSchema)
  .handler(({ data }) => remove(data))

// ── Completions ───────────────────────────────────────────────────────────────

export const toggleHabitCompletion = createServerFn({ method: 'POST' })
  .validator(toggleCompletionSchema)
  .handler(({ data }) => toggleCompletion(data))

// Identity-facing aliases (storage remains `habits` for compatibility).
export const getAllIdentities = getAllHabits
export const syncIdentities = syncHabits
export const createIdentity = createHabit
export const updateIdentity = updateHabit
export const updateIdentityStatus = updateHabitStatus
export const deleteIdentity = deleteHabit
export const toggleIdentityCompletion = toggleHabitCompletion
