import { SanctuaryError } from '#/lib/errors'

export type HabitErrorCode =
  | 'HABIT_NOT_FOUND'
  | 'HABIT_CREATE_FAILED'
  | 'HABIT_UPDATE_FAILED'
  | 'HABIT_DELETE_FAILED'
  | 'HABIT_COMPLETION_TOGGLE_FAILED'
  | 'CATEGORY_CREATE_FAILED'
  | 'CATEGORY_UPDATE_FAILED'
  | 'CATEGORY_DELETE_FAILED'

export class HabitError extends SanctuaryError {
  constructor(
    public readonly code: HabitErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options)
  }
}
