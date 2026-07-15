import { createMiddleware } from '@tanstack/react-start'

// ─────────────────────────────────────────────────────────────────────────────
// Demo Mode Protection Middleware
//
// This is a REQUEST middleware (default type — not { type: 'function' }).
// Request middleware has access to `request` in the .server() callback,
// allowing us to inspect raw HTTP headers like Content-Length.
//
// Registered globally in src/start.ts as requestMiddleware — wraps every
// request including server function RPC calls, SSR, and server routes.
//
// Active only when VITE_DEMO_MODE=true.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_BODY_BYTES = 50_000 // 50 KB

export const demoProtectionMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // No-op outside demo mode — zero overhead for desktop production
    if (process.env.VITE_DEMO_MODE !== 'true') {
      return next()
    }

    // Reject oversized payloads before the body is parsed.
    // Content-Length is always set by the browser for server function RPC calls.
    const contentLength = parseInt(
      request.headers.get('content-length') ?? '0',
      10,
    )
    if (contentLength > MAX_BODY_BYTES) {
      throw new Error(
        `[Demo] Request body too large (${contentLength} bytes). Maximum is ${MAX_BODY_BYTES} bytes.`,
      )
    }

    return next()
  },
)
