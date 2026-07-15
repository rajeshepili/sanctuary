import { createServerFn } from '@tanstack/react-start'
import {
  createEntrySchema,
  updateEntrySchema,
  deleteEntrySchema,
  togglePinSchema,
  getEntrySchema,
  listEntriesSchema,
} from './journal.schema'

export const getAllEntries = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findAll } = await import('./journal.repository')
    return findAll()
  },
)

export const listEntries = createServerFn({ method: 'GET' })
  .validator(listEntriesSchema)
  .handler(async ({ data }) => {
    const { list } = await import('./journal.repository')
    return list(data)
  })

export const getDeletedEntries = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findTrash } = await import('./journal.repository')
    return findTrash()
  },
)

export const getEntry = createServerFn({ method: 'GET' })
  .validator(getEntrySchema)
  .handler(async ({ data }) => {
    const { findById } = await import('./journal.repository')
    return findById(data)
  })

export const createEntry = createServerFn({ method: 'POST' })
  .validator(createEntrySchema)
  .handler(async ({ data }) => {
    const { create } = await import('./journal.repository')
    return create(data)
  })

export const updateEntry = createServerFn({ method: 'POST' })
  .validator(updateEntrySchema)
  .handler(async ({ data }) => {
    const { update } = await import('./journal.repository')
    return update(data)
  })

export const togglePin = createServerFn({ method: 'POST' })
  .validator(togglePinSchema)
  .handler(async ({ data }) => {
    const { togglePin: togglePinRepo } = await import('./journal.repository')
    return togglePinRepo(data)
  })

export const deleteEntry = createServerFn({ method: 'POST' })
  .validator(deleteEntrySchema)
  .handler(async ({ data }) => {
    const { remove } = await import('./journal.repository')
    return remove(data)
  })

export const undeleteEntry = createServerFn({ method: 'POST' })
  .validator(deleteEntrySchema)
  .handler(async ({ data }) => {
    const { restore } = await import('./journal.repository')
    return restore(data.id)
  })

export const permanentDeleteEntry = createServerFn({ method: 'POST' })
  .validator(deleteEntrySchema)
  .handler(async ({ data }) => {
    const { permanentRemove } = await import('./journal.repository')
    return permanentRemove(data.id)
  })
