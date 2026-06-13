/**
 * Safely accesses window.localStorage without throwing errors when
 * storage is disabled (e.g., by privacy settings or quota limits).
 */

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function safely<T>(callback: () => T): T | null {
  try {
    return callback()
  } catch {
    return null
  }
}

export const localStore = {
  get: (key: string): string | null => {
    const storage = getStorage()
    if (!storage) return null
    return safely(() => storage.getItem(key)) ?? null
  },

  set: (key: string, value: string): boolean => {
    const storage = getStorage()
    if (!storage) return false
    const success = safely(() => {
      storage.setItem(key, value)
      return true
    })
    return !!success
  },

  remove: (key: string): void => {
    const storage = getStorage()
    if (!storage) return
    safely(() => {
      storage.removeItem(key)
    })
  },

  clear: (): void => {
    const storage = getStorage()
    if (!storage) return
    safely(() => {
      storage.clear()
    })
  },

  dispatchStorageEvent: (): void => {
    if (typeof window !== 'undefined') {
      safely(() => window.dispatchEvent(new Event('storage')))
    }
  },
}
