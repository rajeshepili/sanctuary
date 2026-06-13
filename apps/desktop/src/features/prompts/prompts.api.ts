import { createServerFn } from '@tanstack/react-start'
import {
  addPromptSchema,
  deletePromptSchema,
  updatePromptSchema,
} from './prompts.schema'
import {
  getActivePromptsService,
  addPromptService,
  updatePromptService,
  deletePromptService,
} from './prompts.service'

export const getPrompts = createServerFn({ method: 'GET' }).handler(() =>
  getActivePromptsService(),
)

export const addPrompt = createServerFn({ method: 'POST' })
  .inputValidator(addPromptSchema)
  .handler(({ data }) => addPromptService(data))

export const updatePrompt = createServerFn({ method: 'POST' })
  .inputValidator(updatePromptSchema)
  .handler(({ data }) => updatePromptService(data))

export const deletePrompt = createServerFn({ method: 'POST' })
  .inputValidator(deletePromptSchema)
  .handler(({ data }) => deletePromptService(data))
