import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom'

// Global mock for TanStack Start server functions to avoid AsyncLocalStorage context errors
vi.mock('@tanstack/react-start', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    createServerFn: vi.fn(() => ({
      handler: vi.fn((fn) => fn),
    })),
  }
})

// Suppress console logs during tests unless explicitly needed
const originalError = console.error
const originalWarn = console.warn

/** Stable ResizeObserver constructor mock — re-applied after each clearAllMocks call */
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

function applyBrowserMocks() {
  if (typeof window !== 'undefined') {
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()
    // Must be a real class so `new ResizeObserver()` works (floating-ui requirement)
    window.ResizeObserver = ResizeObserverMock
    // Mock IntersectionObserver (used by some Radix primitives)
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as typeof IntersectionObserver
  }
}

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

  applyBrowserMocks()
})

beforeEach(() => {
  // Re-apply after vi.clearAllMocks() resets the mocks in afterEach
  applyBrowserMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
