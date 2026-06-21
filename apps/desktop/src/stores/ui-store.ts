import { create } from 'zustand'
import type { ThemeMood } from '#/types'

interface UIState {
  isLocked: boolean
  setLocked: (locked: boolean) => void

  isFocusMode: boolean
  setFocusMode: (focused: boolean) => void

  // Dev
  forcedMood: ThemeMood | null
  setForcedMood: (mood: ThemeMood | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLocked: true, // Will be initialized by the shell based on privacy settings
  setLocked: (locked) => set({ isLocked: locked }),

  isFocusMode: false,
  setFocusMode: (focused) => set({ isFocusMode: focused }),

  forcedMood: null,
  setForcedMood: (mood) => set({ forcedMood: mood }),
}))
