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
}
