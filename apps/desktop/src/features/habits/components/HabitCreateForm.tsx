import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { useHabitForm } from '../hooks/useHabitForm'
import { categoriesQueryOptions } from '../categories.options'
import type { HabitFrequency, HabitPriority } from '#/types'

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Flexible' },
]

const PRIORITIES: { value: HabitPriority; label: string; color: string }[] = [
  {
    value: 'low',
    label: 'Low',
    color: 'text-green-500 bg-green-500/10',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-yellow-500 bg-yellow-500/10',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-red-500 bg-red-500/10',
  },
]

const WEEKDAYS = [
  { label: 'mon', value: 1 },
  { label: 'tue', value: 2 },
  { label: 'wed', value: 3 },
  { label: 'thu', value: 4 },
  { label: 'fri', value: 5 },
  { label: 'sat', value: 6 },
  { label: 'sun', value: 0 },
]

interface HabitCreateFormProps {
  onCreate: (habit: {
    name: string
    identityLabel: string | null
    miniDesc: string | null
    plusDesc: string | null
    eliteDesc: string | null
    intention: string | null
    frequency: HabitFrequency
    interval: number
    daysOfWeek: number[] | null
    priority: HabitPriority
    categoryId: number | null
  }) => void
  onCancel: () => void
}

export function HabitCreateForm({ onCreate, onCancel }: HabitCreateFormProps) {
  const { state, actions, getSubmitData } = useHabitForm()
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions)

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const data = getSubmitData()
      if (!data.name) return
      onCreate(data)
    },
    [getSubmitData, onCreate],
  )

  return (
    <form onSubmit={handleCreate} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          Adopt New Identity
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Decide who you wish to become, then prove it with a small daily
          action.
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
        <Label>
          Daily Action{' '}
          <span className="font-normal text-muted-foreground">
            (the habit that proves it)
          </span>
        </Label>
        <Input
          value={state.name}
          onChange={(e) => actions.setName(e.target.value)}
          placeholder="e.g. Put on my running shoes"
          required
          className="bg-background/60 border-border/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Your 'Why'{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
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
          <Input
            value={state.miniDesc}
            onChange={(e) => actions.setMiniDesc(e.target.value)}
            placeholder="e.g. Read 1 page"
            className="bg-background/60 border-border/50 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Target Action</Label>
          <Input
            value={state.plusDesc}
            onChange={(e) => actions.setPlusDesc(e.target.value)}
            placeholder="e.g. Read 15 mins"
            className="bg-background/60 border-border/50 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Bonus Action</Label>
          <Input
            value={state.eliteDesc}
            onChange={(e) => actions.setEliteDesc(e.target.value)}
            placeholder="e.g. Read a chapter"
            className="bg-background/60 border-border/50 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => actions.setPriority(p.value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${state.priority === p.value ? `${p.color} border-current` : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select
            value={state.categoryId || ''}
            onChange={(e) => actions.setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
            className="flex h-9 w-full rounded-md border border-border/50 bg-background/60 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">No Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label>Interval</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Every</span>
            <Input 
              type="number"
              min={1}
              value={state.interval}
              onChange={(e) => actions.setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-background/60 border-border/50"
            />
            <span className="text-sm text-muted-foreground capitalize">
              {state.frequency === 'daily' ? 'days' : state.frequency === 'weekly' ? 'weeks' : state.frequency === 'monthly' ? 'months' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Schedule</Label>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => actions.setFrequency(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${state.frequency === f.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {(state.frequency === 'weekly' || state.frequency === 'custom' || state.frequency === 'monthly') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 pt-2"
            >
              <span className="text-xs text-muted-foreground">On specific days (optional):</span>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => actions.toggleCustomDay(day.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all border ${state.customDays.includes(day.value) ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!state.name.trim()}
          className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl flex items-center justify-center gap-2"
        >
          Adopt Identity
          <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
            ↵
          </Kbd>
        </button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
