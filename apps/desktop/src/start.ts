import { createStart, createCsrfMiddleware } from '@tanstack/react-start'
import { demoProtectionMiddleware } from '#/server/middleware'

/**
 * TanStack Start global configuration.
 *
 * IMPORTANT: When src/start.ts is defined, TanStack Start no longer
 * auto-registers its built-in CSRF middleware. We must add it explicitly.
 *
 * Middleware execution order (requestMiddleware runs for every request):
 *   1. csrfMiddleware   — blocks cross-origin server function calls
 *   2. demoProtectionMiddleware — enforces 50 KB body cap in demo mode
 */

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, demoProtectionMiddleware],
}))
