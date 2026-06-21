export type ErrorCode = string

export abstract class SanctuaryError extends Error {
  public abstract readonly code: ErrorCode
  public readonly status: number

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message)
    this.name = this.constructor.name
    this.status = options?.status ?? 500
    if (options?.cause) {
      this.cause = options.cause
    }
  }
}

export class DatabaseError extends SanctuaryError {
  public readonly code = 'DATABASE_ERROR'
  constructor(message: string = 'Database operation failed', cause?: unknown) {
    super(message, { status: 500, cause })
  }
}
