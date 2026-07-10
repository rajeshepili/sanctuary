import { SanctuaryError } from '#/lib/errors'

export type CategoryErrorCode =
  | 'CATEGORY_NOT_FOUND'
  | 'CATEGORY_CREATE_FAILED'
  | 'CATEGORY_UPDATE_FAILED'
  | 'CATEGORY_DELETE_FAILED'

export class CategoryError extends SanctuaryError {
  constructor(
    public readonly code: CategoryErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options)
  }
}
