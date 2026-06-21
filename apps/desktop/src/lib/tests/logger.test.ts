import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createLogger, Logger } from '#/lib/logger'

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('can be created via factory', () => {
    const logger = createLogger('test')
    expect(logger).toBeInstanceOf(Logger)
  })

  it('prefixes info logs correctly', () => {
    const logger = createLogger('app')
    logger.info('Started', { id: 1 })
    expect(console.info).toHaveBeenCalledWith('[app] [INFO] Started', { id: 1 })
  })

  it('prefixes warn logs correctly', () => {
    const logger = createLogger('app')
    logger.warn('Warning limit', 42)
    expect(console.warn).toHaveBeenCalledWith('[app] [WARN] Warning limit', 42)
  })

  it('prefixes error logs correctly with optional error object', () => {
    const logger = createLogger('app')
    const err = new Error('Fail')
    logger.error('Crashed', err, 'extra')
    expect(console.error).toHaveBeenCalledWith(
      '[app] [ERROR] Crashed',
      err,
      'extra',
    )
  })

  it('prefixes error logs correctly without error object', () => {
    const logger = createLogger('app')
    logger.error('Just a message')
    expect(console.error).toHaveBeenCalledWith(
      '[app] [ERROR] Just a message',
      undefined,
    )
  })

  it('prefixes debug logs correctly when in DEV', () => {
    const originalEnv = import.meta.env.DEV
    import.meta.env.DEV = true

    const logger = createLogger('app')
    logger.debug('Debugging details', 123)
    expect(console.debug).toHaveBeenCalledWith(
      '[app] [DEBUG] Debugging details',
      123,
    )

    import.meta.env.DEV = originalEnv
  })

  it('does not debug log when not in DEV', () => {
    const originalEnv = import.meta.env.DEV
    import.meta.env.DEV = false

    const logger = createLogger('app')
    logger.debug('Debugging details')
    expect(console.debug).not.toHaveBeenCalled()

    import.meta.env.DEV = originalEnv
  })
})
