import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Kbd } from '#/components/ui/kbd'
import { Button } from '#/components/ui/button'

import { habitsQueryOptions } from '#/features/habits/habits.options'
import { useHabitsMutations } from '#/features/habits/habits.mutations'

import { HabitsList } from '#/features/habits/components/HabitsList'
import { HabitMetrics } from '#/features/habits/components/HabitMetrics'
import { Hero } from '#/components/layout/Hero'
import { FocusSection } from '#/components/layout/FocusSection'
import {
  getLast30DaysList,
  isScheduledOn,
  toLocalDateString,
} from '#/utils/streak'
import { buildCompletionMap } from '#/features/habits/habits.selectors'

import type { HabitFrequency, HabitPriority, HabitCategory } from '#/types'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '#/config/branding'

export const Route = createFileRoute('/__app/habits')({
  component: HabitsPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(habitsQueryOptions())
  },
})

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
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-yellow-500 bg-yellow-500/10',
  },
  { value: 'hard', label: 'Hard', color: 'text-red-500 bg-red-500/10' },
]

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

function HabitsPage() {
  const { data } = useSuspenseQuery(habitsQueryOptions())
  const { createHabit, updateHabitStatus, deleteHabit, toggleCompletion } =
    useHabitsMutations()

  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [intention, setIntention] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('every_day')
  const [customDays, setCustomDays] = useState<string[]>([])
  const [priority, setPriority] = useState<HabitPriority>('medium')
  const [category, setCategory] = useState<HabitCategory>('growth')

  const resetForm = () => {
    setName('')
    setIntention('')
    setFrequency('every_day')
    setCustomDays([])
    setPriority('medium')
    setCategory('growth')
    setShowForm(false)
  }

  const handleCreate = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault()
      if (!name.trim()) return
      await createHabit({
        name: name.trim(),
        intention: intention.trim() || null,
        frequency,
        daysOfWeek: frequency === 'custom' ? customDays.join(',') : null,
        priority,
        category,
      })
      resetForm()
    },
    [name, intention, frequency, customDays, priority, category, createHabit],
  )

  const toggleCustomDay = (day: string) =>
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )

  const metrics = useMemo(() => {
    const activeHabits = data.habits.filter((h) => h.status === 'active')

    const sortedByStreak = [...data.habits].sort(
      (a, b) => b.currentStreak - a.currentStreak,
    )
    const topStreakHabit = sortedByStreak.length > 0 ? sortedByStreak[0] : null
    const maxStreakValue = topStreakHabit ? topStreakHabit.currentStreak : 0
    const streakLeaderName =
      maxStreakValue > 0 && topStreakHabit ? topStreakHabit.name : 'None yet'

    const totalCompletionsCount = data.completions.length

    const completionMap = buildCompletionMap(data.completions)
    const { scheduled, completed } = getLast30DaysList().reduce(
      (acc, dateStr) => {
        activeHabits.forEach((habit) => {
          const habitStartStr = toLocalDateString(habit.createdAt)
          if (dateStr < habitStartStr) return

          if (!isScheduledOn(dateStr, habit.frequency, habit.daysOfWeek)) return
          acc.scheduled++
          if (completionMap.get(habit.id)?.has(dateStr)) acc.completed++
        })
        return acc
      },
      { scheduled: 0, completed: 0 },
    )
    const consistencyScore =
      scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0

    return {
      maxStreakValue,
      streakLeaderName,
      totalCompletionsCount,
      consistencyScore,
      activeHabits,
    }
  }, [data])

  return (
    <>
      <Hero title={PAGE_TITLES.habits} description={PAGE_DESCRIPTIONS.habits} />

      <FocusSection>
        <div className="space-y-8">
          <HabitMetrics
            totalHabits={metrics.activeHabits.length}
            streakLeaderName={metrics.streakLeaderName}
            maxStreakValue={metrics.maxStreakValue}
            totalCompletionsCount={metrics.totalCompletionsCount}
            consistencyScore={metrics.consistencyScore}
          />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">All Habits</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data.habits.length} habit{data.habits.length !== 1 ? 's' : ''}{' '}
                established
              </p>
            </div>
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="w-4 h-4" />
              New Habit
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showForm ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                onSubmit={handleCreate}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="p-6 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm space-y-5"
              >
                <h3 className="font-bold text-foreground">
                  Establish New Habit
                </h3>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Habit Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning meditation"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-border/50 bg-background/60 focus:outline-none focus:border-primary/60 transition-all"
                  />
                </div>

                {/* Intention */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Intention{' '}
                    <span className="font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="e.g. To find clarity before the day begins"
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-border/50 bg-background/60 focus:outline-none focus:border-primary/60 transition-all"
                  />
                </div>

                {/* Category & Priority row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                            category === c.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border/50 text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {c.emoji} {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                            priority === p.value
                              ? `${p.color} border-current`
                              : 'border-border/50 text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Frequency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFrequency(f.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          frequency === f.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border/50 text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom day picker */}
                  <AnimatePresence>
                    {frequency === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 pt-2"
                      >
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleCustomDay(day)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all border ${
                              customDays.includes(day)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border/50 text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex-1"
                  >
                    Establish Habit
                    <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
                      ↵
                    </Kbd>
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <HabitsList
            habitsList={data.habits}
            completions={data.completions}
            onToggleDate={toggleCompletion}
            onUpdateStatus={updateHabitStatus}
            onDeleteHabit={deleteHabit}
          />
        </div>
      </FocusSection>
    </>
  )
}
