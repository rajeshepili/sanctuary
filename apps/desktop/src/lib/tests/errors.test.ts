import { describe, expect, it } from 'vitest'
import { SanctuaryError, DatabaseError } from '#/lib/errors'

class CustomError extends SanctuaryError {
  public readonly code = 'CUSTOM_ERROR'
}

describe('Errors Utils', () => {
  describe('SanctuaryError', () => {
    it('sets default properties correctly', () => {
      const err = new CustomError('Something went wrong')
      expect(err.message).toBe('Something went wrong')
      expect(err.name).toBe('CustomError')
      expect(err.code).toBe('CUSTOM_ERROR')
      expect(err.status).toBe(500)
      expect(err.cause).toBeUndefined()
    })

    it('sets custom status correctly', () => {
      const err = new CustomError('Not Found', { status: 404 })
      expect(err.status).toBe(404)
    })

    it('sets cause correctly', () => {
      const underlying = new Error('Underlying failure')
      const err = new CustomError('Failed', { cause: underlying })
      expect(err.cause).toBe(underlying)
    })
  })

  describe('DatabaseError', () => {
    it('has correct code and defaults', () => {
      const err = new DatabaseError()
      expect(err.message).toBe('Database operation failed')
      expect(err.code).toBe('DATABASE_ERROR')
      expect(err.status).toBe(500)
      expect(err.name).toBe('DatabaseError')
    })

    it('allows custom message and cause', () => {
      const cause = new Error('SQL constraint')
      const err = new DatabaseError('Failed to insert', cause)
      expect(err.message).toBe('Failed to insert')
      expect(err.cause).toBe(cause)
    })
  })
})
