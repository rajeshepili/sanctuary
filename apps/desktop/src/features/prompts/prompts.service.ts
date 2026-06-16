import { getDb } from '#/database'
import { customPrompts } from '#/database/schema'
import { eq, desc } from 'drizzle-orm'
import type {
  AddPromptInput,
  UpdatePromptInput,
  DeletePromptInput,
} from './prompts.schema'
import { PromptError } from './prompts.errors'
import type { CustomPrompt } from '#/types'
import { getFirstOrThrow, ensureRowsAffected } from '#/database/utils'

export async function getActivePromptsService(): Promise<CustomPrompt[]> {
  const db = await getDb()

  return db.query.customPrompts.findMany({
    orderBy: [desc(customPrompts.createdAt)],
  })
}

export async function addPromptService(data: AddPromptInput): Promise<CustomPrompt> {
  const db = await getDb()
  const results = await db
    .insert(customPrompts)
    .values({ text: data.text })
    .returning()
  
  return getFirstOrThrow(results, new PromptError('PROMPT_CREATE_FAILED', 'Failed to create prompt'))
}

export async function updatePromptService(data: UpdatePromptInput): Promise<CustomPrompt> {
  const db = await getDb()
  const results = await db
    .update(customPrompts)
    .set({ text: data.text })
    .where(eq(customPrompts.id, data.id))
    .returning()

  return getFirstOrThrow(results, new PromptError('PROMPT_NOT_FOUND', `Prompt with id ${data.id} not found`, { status: 404 }))
}

export async function deletePromptService(
  data: DeletePromptInput,
): Promise<void> {
  const db = await getDb()
  const results = await db.delete(customPrompts).where(eq(customPrompts.id, data.id)).returning({ id: customPrompts.id })
  
  ensureRowsAffected(results, new PromptError('PROMPT_NOT_FOUND', `Prompt with id ${data.id} not found`, { status: 404 }))
}
