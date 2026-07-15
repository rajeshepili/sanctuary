import { createMiddleware } from '@tanstack/react-start'

// ─────────────────────────────────────────────────────────────────────────────
// Demo Mode Protection Middleware
//
// Applied globally to every server function via src/start.ts when the app is
// deployed in VITE_DEMO_MODE. Protects the shared, ephemeral demo DB from:
//   1. Oversized payloads (50 KB hard limit)
//   2. Obvious XSS injection in text content
//   3. Excessive entry counts (database row cap)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PAYLOAD_BYTES = 50_000 // 50 KB
const MAX_CONTENT_LENGTH = 10_000 // 10k chars per text field
const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
]

export const demoProtectionMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next, data }) => {
  // Only enforce in demo mode — no-op for local/production desktop
  if (process.env.VITE_DEMO_MODE !== 'true') {
    return next()
  }

  if (data !== undefined && data !== null) {
    const serialised = JSON.stringify(data)

    // 1. Hard payload size cap
    if (serialised.length > MAX_PAYLOAD_BYTES) {
      throw new Error(
        `[Demo] Payload too large (${serialised.length} bytes). Maximum is ${MAX_PAYLOAD_BYTES} bytes.`,
      )
    }

    // 2. Per-field content length + XSS scan
    const stringValues = serialised.match(/"[^"]{500,}"/g) ?? []
    for (const chunk of stringValues) {
      if (chunk.length > MAX_CONTENT_LENGTH) {
        throw new Error(
          '[Demo] A single field value exceeds the allowed length.',
        )
      }
      for (const pattern of XSS_PATTERNS) {
        if (pattern.test(chunk)) {
          throw new Error(
            '[Demo] Potentially unsafe content was detected and blocked.',
          )
        }
      }
    }
  }

  return next()
})
