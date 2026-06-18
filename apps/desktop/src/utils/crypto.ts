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

/**
 * Derives a CryptoKey from a passphrase using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypts data using AES-GCM and a passphrase.
 * Returns a base64 string containing salt + iv + ciphertext.
 */
export async function encryptData(data: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data),
  )

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts data using AES-GCM and a passphrase.
 */
export async function decryptData(encryptedBase64: string, passphrase: string): Promise<string> {
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split('')
      .map((c) => c.charCodeAt(0)),
  )

  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const ciphertext = combined.slice(28)

  const key = await deriveKey(passphrase, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}
