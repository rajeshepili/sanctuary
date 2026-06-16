import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom'

// Suppress console logs during tests unless explicitly needed
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = vi.fn((...args) => {
    // Allow test failures to log
    if (
      String(args[0]).includes('Error') ||
      String(args[0]).includes('error')
    ) {
      originalError(...args)
    }
  })

  console.warn = vi.fn((...args) => {
    // Log deprecation warnings but suppress others
    if (String(args[0]).includes('deprecat')) {
      originalWarn(...args)
    }
  })

  // Mock global objects that aren't in JSDOM
  if (typeof window !== 'undefined') {
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()
    
    // Mock ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
