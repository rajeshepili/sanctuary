import type { JournalMood } from '#/types'

export const MOODS: {
  value: JournalMood
  emoji: string
  label: string
  color: string
  activeColor: string
}[] = [
  {
    value: 'happy',
    emoji: '☀️',
    label: 'Happy',
    color: 'hover:bg-amber-500/10 hover:text-amber-500',
    activeColor:
      'bg-amber-500/15 text-amber-500 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  },
  {
    value: 'calm',
    emoji: '🌿',
    label: 'Calm',
    color: 'hover:bg-teal-500/10 hover:text-teal-500',
    activeColor:
      'bg-teal-500/15 text-teal-500 border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]',
  },
  {
    value: 'focused',
    emoji: '🎯',
    label: 'Focused',
    color: 'hover:bg-indigo-500/10 hover:text-indigo-500',
    activeColor:
      'bg-indigo-500/15 text-indigo-500 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
  },
  {
    value: 'anxious',
    emoji: '🌀',
    label: 'Anxious',
    color: 'hover:bg-purple-500/10 hover:text-purple-500',
    activeColor:
      'bg-purple-500/15 text-purple-500 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
  },
  {
    value: 'sad',
    emoji: '🌧️',
    label: 'Sad',
    color: 'hover:bg-blue-500/10 hover:text-blue-500',
    activeColor:
      'bg-blue-500/15 text-blue-500 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  },
  {
    value: 'energetic',
    emoji: '⚡',
    label: 'Energetic',
    color: 'hover:bg-rose-500/10 hover:text-rose-500',
    activeColor:
      'bg-rose-500/15 text-rose-500 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
  },
  {
    value: 'tired',
    emoji: '🌙',
    label: 'Tired',
    color: 'hover:bg-slate-500/10 hover:text-slate-500',
    activeColor:
      'bg-slate-500/15 text-slate-500 border-slate-500/30 shadow-[0_0_12px_rgba(100,116,139,0.15)]',
  },
]

export function getMoodDetails(moodValue: JournalMood | null | undefined) {
  if (!moodValue) return null
  return MOODS.find((m) => m.value === moodValue) || null
}
