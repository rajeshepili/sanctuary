import { createServerFn } from '@tanstack/react-start'
import {
  createEntrySchema,
  updateEntrySchema,
  deleteEntrySchema,
  togglePinSchema,
  getEntrySchema,
  listEntriesSchema,
} from './journal.schema'
import {
  findAll,
  findTrash,
  create,
  update,
  remove,
  permanentRemove,
  togglePin as togglePinRepo,
  restore,
  findById,
  list,
} from './journal.repository'

export const getAllEntries = createServerFn({ method: 'GET' }).handler(() =>
  findAll(),
)

export const listEntries = createServerFn({ method: 'GET' })
  .validator(listEntriesSchema)
  .handler(({ data }) => list(data))

export const getDeletedEntries = createServerFn({ method: 'GET' }).handler(() =>
  findTrash(),
)

export const getEntry = createServerFn({ method: 'GET' })
  .validator(getEntrySchema)
  .handler(({ data }) => findById(data))

export const createEntry = createServerFn({ method: 'POST' })
  .validator(createEntrySchema)
  .handler(({ data }) => create(data))

export const updateEntry = createServerFn({ method: 'POST' })
  .validator(updateEntrySchema)
  .handler(({ data }) => update(data))

export const togglePin = createServerFn({ method: 'POST' })
  .validator(togglePinSchema)
  .handler(({ data }) => togglePinRepo(data))

export const deleteEntry = createServerFn({ method: 'POST' })
  .validator(deleteEntrySchema)
  .handler(({ data }) => remove(data))

export const undeleteEntry = createServerFn({ method: 'POST' })
  .validator(deleteEntrySchema)
  .handler(({ data }) => restore(data.id))

export const permanentDeleteEntry = createServerFn({ method: 'POST' })
  .validator(deleteEntrySchema)
  .handler(({ data }) => permanentRemove(data.id))
