import { createServerFn } from '@tanstack/react-start'
import {
  createHabitSchema,
  updateHabitSchema,
  updateHabitStatusSchema,
  deleteHabitSchema,
  toggleCompletionSchema,
} from './habits.schema'

// ── Read ─────────────────────────────────────────────────────────────────────

export const getAllHabits = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findAll } = await import('./habits.repository')
    return findAll()
  },
)

// ── Sync / Lifecycle ─────────────────────────────────────────────────────────

export const syncHabits = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { reactivateHabits } = await import('./habits.repository')
    return reactivateHabits()
  },
)

// ── Habit CRUD ───────────────────────────────────────────────────────────────

export const createHabit = createServerFn({ method: 'POST' })
  .validator(createHabitSchema)
  .handler(async ({ data }) => {
    const { create } = await import('./habits.repository')
    return create(data)
  })

export const updateHabit = createServerFn({ method: 'POST' })
  .validator(updateHabitSchema)
  .handler(async ({ data }) => {
    const { update } = await import('./habits.repository')
    return update(data)
  })

export const updateHabitStatus = createServerFn({ method: 'POST' })
  .validator(updateHabitStatusSchema)
  .handler(async ({ data }) => {
    const { updateStatus } = await import('./habits.repository')
    return updateStatus(data)
  })

export const deleteHabit = createServerFn({ method: 'POST' })
  .validator(deleteHabitSchema)
  .handler(async ({ data }) => {
    const { remove } = await import('./habits.repository')
    return remove(data)
  })

// ── Completions ───────────────────────────────────────────────────────────────

export const toggleHabitCompletion = createServerFn({ method: 'POST' })
  .validator(toggleCompletionSchema)
  .handler(async ({ data }) => {
    const { toggleCompletion } = await import('./completions.repository')
    return toggleCompletion(data)
  })

// Identity-facing aliases (storage remains `habits` for compatibility).
export const getAllIdentities = getAllHabits
export const syncIdentities = syncHabits
export const createIdentity = createHabit
export const updateIdentity = updateHabit
export const updateIdentityStatus = updateHabitStatus
export const deleteIdentity = deleteHabit
export const toggleIdentityCompletion = toggleHabitCompletion
