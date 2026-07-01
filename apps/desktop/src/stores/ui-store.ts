import { create } from 'zustand'
import type { ThemeMood } from '#/types'

interface UIState {
  isFocusMode: boolean
  setFocusMode: (focused: boolean) => void

  pinSessionUnlocked: boolean
  unlockPinSession: () => void
  lockPinSession: () => void

  // Dev
  forcedMood: ThemeMood | null
  setForcedMood: (mood: ThemeMood | null) => void
}

function readPinSession(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('pin_unlocked') === '1'
}

export const useUIStore = create<UIState>((set) => ({
  isFocusMode: false,
  setFocusMode: (focused) => set({ isFocusMode: focused }),

  pinSessionUnlocked: readPinSession(),
  unlockPinSession: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pin_unlocked', '1')
    }
    set({ pinSessionUnlocked: true })
  },
  lockPinSession: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pin_unlocked')
    }
    set({ pinSessionUnlocked: false })
  },

  forcedMood: null,
  setForcedMood: (mood) => set({ forcedMood: mood }),
}))
