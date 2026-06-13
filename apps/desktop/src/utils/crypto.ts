/**
 * Hashes a 4-digit PIN using SHA-256 with a static salt.
 * Designed for local-only obscuration to prevent plaintext storage.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'sanctuary_salt_v1')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
