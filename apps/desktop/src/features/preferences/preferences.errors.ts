import { SanctuaryError } from '#/lib/errors'

export type PreferencesErrorCode =
  | 'PREFERENCES_NOT_FOUND'
  | 'PREFERENCES_UPDATE_FAILED'

export class PreferencesError extends SanctuaryError {
  constructor(
    public readonly code: PreferencesErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options)
  }
}
