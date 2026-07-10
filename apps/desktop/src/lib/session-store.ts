export const sessionStore = {
  getPendingPrompt: () => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('pending_prompt')
  },
  setPendingPrompt: (text: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_prompt', text)
    }
  },
  consumePendingPrompt: () => {
    if (typeof window === 'undefined') return null
    const v = sessionStorage.getItem('pending_prompt')
    if (v) sessionStorage.removeItem('pending_prompt')
    return v
  },

  /** PIN stays unlocked until the app window is closed (sessionStorage). */
  isPinSessionUnlocked: () => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('pin_unlocked') === '1'
  },
  setPinSessionUnlocked: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pin_unlocked', '1')
    }
  },
  clearPinSession: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pin_unlocked')
    }
  },
}
