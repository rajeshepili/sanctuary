import { SanctuaryError } from '#/lib/errors'

export type JournalErrorCode =
  | 'JOURNAL_NOT_FOUND'
  | 'JOURNAL_CREATE_FAILED'
  | 'JOURNAL_UPDATE_FAILED'
  | 'JOURNAL_DELETE_FAILED'
  | 'JOURNAL_TOGGLE_PIN_FAILED'
  | 'JOURNAL_MEDIA_PREPARATION_FAILED'

export class JournalError extends SanctuaryError {
  constructor(
    public readonly code: JournalErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options)
  }
}
