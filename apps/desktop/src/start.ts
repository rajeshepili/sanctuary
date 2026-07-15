import { createStart } from '@tanstack/react-start'
import { demoProtectionMiddleware } from '#/server/middleware'

/**
 * Global TanStack Start configuration.
 *
 * `functionMiddleware` runs automatically before every server function in the
 * application — no need to thread it through each `.api.ts` file manually.
 *
 * In demo mode (`VITE_DEMO_MODE=true`) the `demoProtectionMiddleware` enforces:
 *  - 50 KB max payload per request
 *  - 10 000 char per-field content limit
 *  - XSS / injection pattern detection
 */
export const startInstance = createStart(() => ({
  functionMiddleware: [demoProtectionMiddleware],
}))
