/**
 * Generates a random 16-character hex salt.
 */
export function generateSalt(): string {
  const array = new Uint8Array(8)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Hashes a 4-digit PIN using SHA-256 with a provided salt.
 * Returns the hash in the format: salt$hash
 */
export async function hashPin(pin: string, salt?: string): Promise<string> {
  const finalSalt = salt || generateSalt()
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + finalSalt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  
  return `${finalSalt}$${hash}`
}

/**
 * Verifies a PIN against a stored hash string.
 * Supports both new salt$hash format and legacy SHA-256 format.
 */
export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  // Legacy support for SHA-256 with static salt or plaintext (audit Item 2 fallback)
  if (!stored.includes('$')) {
    const encoder = new TextEncoder()
    // Try legacy static salt first
    const data = encoder.encode(pin + 'sanctuary_salt_v1')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const legacyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    
    return legacyHash === stored || pin === stored
  }

  const [salt] = stored.split('$')
  const newHashed = await hashPin(pin, salt)
  return newHashed === stored
}
