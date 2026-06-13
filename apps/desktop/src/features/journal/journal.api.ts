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
  getAllEntriesService,
  getDeletedEntriesService,
  createEntryService,
  updateEntryService,
  deleteEntryService,
  permanentDeleteEntryService,
  togglePinService,
  undeleteEntryService,
  getEntryService,
  listEntriesService,
} from './journal.service'

export const getAllEntries = createServerFn({ method: 'GET' })
  .handler(() =>
    getAllEntriesService(),
  )

export const listEntries = createServerFn({ method: 'GET' })
  .inputValidator(listEntriesSchema)
  .handler(({ data }) => listEntriesService(data))

export const getDeletedEntries = createServerFn({ method: 'GET' })
  .handler(() =>
    getDeletedEntriesService(),
  )

export const getEntry = createServerFn({ method: 'GET' })
  .inputValidator(getEntrySchema)
  .handler(({ data }) =>
    getEntryService(data),
  )

export const createEntry = createServerFn({ method: 'POST' })
  .inputValidator(createEntrySchema)
  .handler(({ data }) => createEntryService(data))

export const updateEntry = createServerFn({ method: 'POST' })
  .inputValidator(updateEntrySchema)
  .handler(({ data }) => updateEntryService(data))

export const togglePin = createServerFn({ method: 'POST' })
  .inputValidator(togglePinSchema)
  .handler(({ data }) => togglePinService(data))

export const deleteEntry = createServerFn({ method: 'POST' })
  .inputValidator(deleteEntrySchema)
  .handler(({ data }) => deleteEntryService(data))

export const undeleteEntry = createServerFn({ method: 'POST' })
  .inputValidator(deleteEntrySchema)
  .handler(({ data }) => undeleteEntryService(data.id))

export const permanentDeleteEntry = createServerFn({ method: 'POST' })
  .inputValidator(deleteEntrySchema)
  .handler(({ data }) => permanentDeleteEntryService(data.id))
