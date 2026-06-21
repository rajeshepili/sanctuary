import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { localStore } from '#/lib/storage'

describe('Storage Utils', () => {
  let mockStorage: Record<string, string>

  beforeEach(() => {
    mockStorage = {}

    // Mock window.localStorage
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
    }

    vi.stubGlobal('localStorage', localStorageMock)

    // Mock window.dispatchEvent
    vi.stubGlobal('dispatchEvent', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets and gets items', () => {
    expect(localStore.set('foo', 'bar')).toBe(true)
    expect(localStore.get('foo')).toBe('bar')
  })

  it('removes items', () => {
    localStore.set('foo', 'bar')
    localStore.remove('foo')
    expect(localStore.get('foo')).toBeNull()
  })

  it('clears all items', () => {
    localStore.set('foo', 'bar')
    localStore.set('baz', 'qux')
    localStore.clear()
    expect(localStore.get('foo')).toBeNull()
    expect(localStore.get('baz')).toBeNull()
  })

  it('dispatches storage event safely', () => {
    localStore.dispatchStorageEvent()
    expect(window.dispatchEvent).toHaveBeenCalled()
  })

  describe('Error handling', () => {
    it('handles localStorage property access error', () => {
      // Simulate quota exceeded or privacy error by throwing when accessing localStorage
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('Access denied')
        },
        configurable: true,
      })

      expect(localStore.get('foo')).toBeNull()
      expect(localStore.set('foo', 'bar')).toBe(false)
      expect(() => localStore.remove('foo')).not.toThrow()
      expect(() => localStore.clear()).not.toThrow()
    })

    it('handles getItem error gracefully', () => {
      window.localStorage.getItem = () => {
        throw new Error('Fail')
      }
      expect(localStore.get('foo')).toBeNull()
    })

    it('handles setItem error gracefully', () => {
      window.localStorage.setItem = () => {
        throw new Error('Fail')
      }
      expect(localStore.set('foo', 'bar')).toBe(false)
    })

    it('handles dispatchStorageEvent error gracefully', () => {
      window.dispatchEvent = () => {
        throw new Error('Fail')
      }
      expect(() => localStore.dispatchStorageEvent()).not.toThrow()
    })
  })

  describe('SSR Environment', () => {
    const originalWindow = global.window

    beforeEach(() => {
      // @ts-expect-error simulating SSR
      delete global.window
    })

    afterEach(() => {
      global.window = originalWindow
    })

    it('handles non-browser environments gracefully', () => {
      expect(localStore.get('foo')).toBeNull()
      expect(localStore.set('foo', 'bar')).toBe(false)
      expect(() => localStore.remove('foo')).not.toThrow()
      expect(() => localStore.clear()).not.toThrow()
      expect(() => localStore.dispatchStorageEvent()).not.toThrow()
    })
  })
})
