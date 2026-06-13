import { SanctuaryError } from '#/lib/errors'

export type PromptErrorCode =
  | 'PROMPT_NOT_FOUND'
  | 'PROMPT_CREATE_FAILED'
  | 'PROMPT_UPDATE_FAILED'
  | 'PROMPT_DELETE_FAILED'

export class PromptError extends SanctuaryError {
  constructor(
    public readonly code: PromptErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options)
  }
}
