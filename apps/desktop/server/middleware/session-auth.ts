import { defineHandler } from 'nitro/h3'

const SESSION_TOKEN = process.env.SANCTUARY_SESSION_TOKEN

/**
 * Local CSRF Protection Middleware
 *
 * In production, Electron generates a random SANCTUARY_SESSION_TOKEN and injects it
 * into all requests. This middleware enforces that token. This prevents malicious
 * external browser tabs on the user's machine from making arbitrary API requests
 * to the localhost Nitro server port.
 */
export default defineHandler((event) => {
  if (!SESSION_TOKEN) {
    return
  }

  const auth = event.req.headers.get('authorization')
  if (auth === `Bearer ${SESSION_TOKEN}`) {
    return
  }

  return new Response('Unauthorized', { status: 401 })
})
