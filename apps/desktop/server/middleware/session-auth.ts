import { defineHandler } from 'nitro/h3'

const SESSION_TOKEN = process.env.SANCTUARY_SESSION_TOKEN

/**
 * When SANCTUARY_SESSION_TOKEN is set (desktop production), reject requests
 * without a matching Authorization header. Dev and web omit the env var.
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
