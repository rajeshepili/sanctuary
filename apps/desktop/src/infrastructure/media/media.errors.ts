import { SanctuaryError } from '#/lib/errors'

export type MediaErrorCode =
  | 'MEDIA_NOT_FOUND'
  | 'MEDIA_INVALID_FORMAT'
  | 'MEDIA_TOO_LARGE'
  | 'MEDIA_PREPARATION_FAILED'
  | 'MEDIA_SAVE_FAILED'
  | 'MEDIA_DELETE_FAILED'

export class MediaError extends SanctuaryError {
  constructor(
    public readonly code: MediaErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options)
  }
}
