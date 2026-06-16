import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { useHabitForm } from '../hooks/useHabitForm'
import type { HabitFrequency, HabitPriority, HabitCategory } from '#/types'

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'every_day', label: 'Every Day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom Days' },
]

const CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'mind', label: 'Mind', emoji: '🧠' },
  { value: 'body', label: 'Body', emoji: '💪' },
  { value: 'connection', label: 'Connection', emoji: '🤝' },
  { value: 'rest', label: 'Rest', emoji: '😴' },
  { value: 'growth', label: 'Growth', emoji: '🌱' },
]

const PRIORITIES: { value: HabitPriority; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'text-green-500 bg-green-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10' },
  { value: 'hard', label: 'Hard', color: 'text-red-500 bg-red-500/10' },
]

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

interface HabitCreateFormProps {
  onCreate: (habit: {
    name: string
    identityLabel: string | null
    miniDesc: string | null
    plusDesc: string | null
    eliteDesc: string | null
    intention: string | null
    frequency: HabitFrequency
    daysOfWeek: string | null
    priority: HabitPriority
    category: HabitCategory
  }) => Promise<void>
  onCancel: () => void
}

export function HabitCreateForm({ onCreate, onCancel }: HabitCreateFormProps) {
  const { state, actions, getSubmitData } = useHabitForm()

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const data = getSubmitData()
      if (!data.name) return
      await onCreate(data)
    },
    [getSubmitData, onCreate],
  )

  return (
    <form onSubmit={handleCreate} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">Adopt New Identity</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Decide who you wish to become, then prove it with a small daily action.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Who do you wish to become?</Label>
        <Input
          value={state.identityLabel}
          onChange={(e) => actions.setIdentityLabel(e.target.value)}
          placeholder='e.g. "I am a runner", "I am a mindful person"'
          className="bg-background/60 border-border/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Daily Action <span className="font-normal text-muted-foreground">(the habit that proves it)</span></Label>
        <Input
          value={state.name}
          onChange={(e) => actions.setName(e.target.value)}
          placeholder="e.g. Put on my running shoes"
          required
          className="bg-background/60 border-border/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Your 'Why' <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input
          value={state.intention}
          onChange={(e) => actions.setIntention(e.target.value)}
          placeholder="e.g. Because I want to feel strong and capable"
          className="bg-background/60 border-border/50"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>2-Minute Version</Label>
          <Input value={state.miniDesc} onChange={(e) => actions.setMiniDesc(e.target.value)} placeholder="e.g. Read 1 page" className="bg-background/60 border-border/50 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label>Target Action</Label>
          <Input value={state.plusDesc} onChange={(e) => actions.setPlusDesc(e.target.value)} placeholder="e.g. Read 15 mins" className="bg-background/60 border-border/50 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label>Bonus Action</Label>
          <Input value={state.eliteDesc} onChange={(e) => actions.setEliteDesc(e.target.value)} placeholder="e.g. Read a chapter" className="bg-background/60 border-border/50 text-xs" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} type="button" onClick={() => actions.setCategory(c.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${state.category === c.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button key={p.value} type="button" onClick={() => actions.setPriority(p.value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${state.priority === p.value ? `${p.color} border-current` : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Schedule</Label>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => (
            <button key={f.value} type="button" onClick={() => actions.setFrequency(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${state.frequency === f.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {state.frequency === 'custom' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 pt-2">
              {WEEKDAYS.map((day) => (
                <button key={day} type="button" onClick={() => actions.toggleCustomDay(day)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all border ${state.customDays.includes(day) ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                  {day.substring(0, 3)}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={!state.name.trim()} className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl flex items-center justify-center gap-2">
          Adopt Identity
          <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">↵</Kbd>
        </button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
