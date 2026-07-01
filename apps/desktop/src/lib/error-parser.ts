import { SanctuaryError } from './errors'

export interface ParsedError {
  title: string
  message: string
  code: string
  isActionable: boolean
}

export function parseError(error: unknown): ParsedError {
  if (error instanceof SanctuaryError) {
    return {
      title: getTitleForCode(error.code),
      message: error.message,
      code: error.code,
      isActionable: error.status < 500,
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Unexpected Error',
      message: error.message,
      code: 'UNKNOWN_ERROR',
      isActionable: false,
    }
  }

  return {
    title: 'Unknown Error',
    message: 'An unidentifiable error occurred.',
    code: 'GENERIC_ERROR',
    isActionable: false,
  }
}

function getTitleForCode(code: string): string {
  if (code.startsWith('JOURNAL_')) return 'Journal Error'
  if (code.startsWith('HABIT_')) return 'Identity Error'
  if (code.startsWith('MEDIA_')) return 'Media Error'
  if (code.startsWith('PROMPT_')) return 'Prompt Error'
  if (code.startsWith('PREFERENCES_')) return 'Settings Error'

  switch (code) {
    case 'NOT_FOUND':
      return 'Not Found'
    case 'VALIDATION_ERROR':
      return 'Invalid Data'
    case 'UNEXPECTED_ERROR':
      return 'System Error'
    case 'DATABASE_ERROR':
      return 'Database Error'
    default:
      return 'Error'
  }
}
