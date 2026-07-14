import { useState, useEffect } from 'react'
import {
  Target,
  Fingerprint,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { IconButton } from '#/components/ui/icon-button'
import { IdentityDayCell } from '#/features/habits/components/IdentityDayCell'
import { isScheduledOn } from '#/utils/consistency'
import { getDailyActivityWindow, fromLocalDateString } from '#/utils/date'
import { formatScheduleLabel } from '../habits.utils'
import { format } from 'date-fns'
import type { Habit, HabitTier, HabitFrequency, HabitPriority } from '#/types'
import type { UpdateHabitInput } from '../habits.schema'
import { categoriesQueryOptions } from '../subdomains/categories/categories.options'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from '@tanstack/react-form'
import { Field, FieldError } from '#/components/ui/field'
import { cn } from '#/lib/utils'

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
    color: 'text-green-500 bg-green-500/10 border-green-500/30',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-red-500 bg-red-500/10 border-red-500/30',
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

interface IdentityDetailViewProps {
  habit: Habit
  completions: Map<string, string>
  consistency: number
  votes: number
  today: string
  missedYesterday: boolean
  onUpdateStatus: (id: number, status: 'active' | 'resting') => void
  onDelete: (id: number) => void
  onToggleCompletion: (id: number, day: string, tier: HabitTier) => void
  onUpdateHabit: (data: UpdateHabitInput) => void
}

export function IdentityDetailView({
  habit,
  completions,
  consistency,
  votes,
  today,
  missedYesterday,
  onUpdateStatus,
  onDelete,
  onToggleCompletion,
  onUpdateHabit,
}: IdentityDetailViewProps) {
  const scheduleLabel = formatScheduleLabel(habit)
  const [isEditing, setIsEditing] = useState(false)
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions)

  const form = useForm({
    defaultValues: {
      name: habit.name,
      identityLabel: habit.identityLabel ?? '',
      miniDesc: habit.miniDesc ?? '',
      plusDesc: habit.plusDesc ?? '',
      eliteDesc: habit.eliteDesc ?? '',
      intention: habit.intention ?? '',
      frequency: habit.frequency,
      interval: habit.interval,
      customDays: habit.daysOfWeek ?? [],
      targetCount: habit.targetCount ?? null,
      priority: habit.priority,
      categoryId: habit.categoryId,
    },
    onSubmit: ({ value }) => {
      const { customDays, frequency, targetCount, ...rest } = value
      const daysOfWeek =
        frequency === 'weekly' ||
        frequency === 'custom' ||
        frequency === 'monthly'
          ? customDays.length > 0
            ? customDays
            : null
          : null
      const resolvedTargetCount =
        (frequency === 'weekly' || frequency === 'monthly') &&
        targetCount &&
        targetCount > 0
          ? targetCount
          : null

      onUpdateHabit({
        id: habit.id,
        ...rest,
        name: rest.name.trim(),
        identityLabel: rest.identityLabel.trim() || null,
        miniDesc: rest.miniDesc.trim() || null,
        plusDesc: rest.plusDesc.trim() || null,
        eliteDesc: rest.eliteDesc.trim() || null,
        intention: rest.intention.trim() || null,
        frequency,
        daysOfWeek,
        targetCount: resolvedTargetCount,
      })
      setIsEditing(false)
    },
  })

  useEffect(() => {
    if (isEditing) {
      form.reset() // reset to defaults which are derived from the current habit
    }
  }, [isEditing, habit, form])

  const handleSave = () => {
    form.handleSubmit()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    form.reset()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border/40 pb-5">
        <div className="space-y-1.5 flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <form.Field
                name="identityLabel"
                children={(field) => (
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Identity (e.g. I am a runner)"
                    className="bg-background/60 border-border/50 text-xl font-bold"
                  />
                )}
              />
              <form.Field
                name="name"
                validators={{
                  onSubmit: ({ value }) =>
                    !value.trim() ? 'Daily action is required' : undefined,
                }}
                children={(field) => (
                  <Field>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Daily action (required)"
                      className="bg-background/60 border-border/50 text-sm"
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError
                      errors={field.state.meta.errors.map((e) => ({
                        message: String(e),
                      }))}
                    />
                  </Field>
                )}
              />
            </div>
          ) : (
            <>
              <h2
                className={cn(
                  'text-2xl font-bold',
                  habit.status === 'resting'
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground',
                )}
              >
                {habit.identityLabel ?? habit.name}
              </h2>
              {habit.identityLabel && (
                <div className="flex items-center gap-1.5 text-sm text-primary/80 font-semibold">
                  <Target className="w-4 h-4" />
                  <span>Daily Action: {habit.name}</span>
                </div>
              )}
              {habit.intention && !isEditing && (
                <p className="text-sm italic text-muted-foreground font-serif border-l-2 border-primary/30 pl-3 mt-2">
                  "{habit.intention}"
                </p>
              )}
            </>
          )}

          {isEditing && (
            <form.Field
              name="intention"
              children={(field) => (
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Your 'Why' (optional)"
                  className="bg-background/60 border-border/50 text-sm italic"
                />
              )}
            />
          )}

          {missedYesterday && habit.status === 'active' && !isEditing && (
            <div className="flex items-center gap-3 mt-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 uppercase tracking-widest">
                <AlertTriangle className="w-3 h-3" />
                Never Miss Twice
              </div>
              <button
                onClick={() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  const yesterdayStr = yesterday.toISOString().split('T')[0]
                  onToggleCompletion(habit.id, yesterdayStr, 'skipped')
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10"
              >
                <ShieldCheck className="w-3 h-3" />
                Forgive yesterday
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-4 shrink-0">
          {isEditing ? (
            <>
              <IconButton tooltip="Save changes" onClick={handleSave}>
                <Check className="w-4 h-4 text-green-500" />
              </IconButton>
              <IconButton tooltip="Cancel" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                tooltip="Edit identity"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </IconButton>
              <IconButton
                tooltip={
                  habit.status === 'active'
                    ? 'Rest this identity'
                    : 'Resume this identity'
                }
                onClick={() =>
                  onUpdateStatus(
                    habit.id,
                    habit.status === 'active' ? 'resting' : 'active',
                  )
                }
              >
                {habit.status === 'active' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </IconButton>
              <IconButton
                tooltip="Delete this identity"
                variant="danger"
                onClick={() => onDelete(habit.id)}
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {/* Edit mode: schedule + category + priority */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Tier descriptions */}
            <div className="grid grid-cols-3 gap-3">
              <form.Field
                name="miniDesc"
                children={(field) => (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      2-Min Version
                    </Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Minimum effective dose"
                      className="bg-background/60 border-border/50 text-xs"
                    />
                  </div>
                )}
              />
              <form.Field
                name="plusDesc"
                children={(field) => (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                      Target Action
                    </Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="The target action"
                      className="bg-background/60 border-border/50 text-xs"
                    />
                  </div>
                )}
              />
              <form.Field
                name="eliteDesc"
                children={(field) => (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Bonus Action
                    </Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Going above and beyond"
                      className="bg-background/60 border-border/50 text-xs"
                    />
                  </div>
                )}
              />
            </div>

            {/* Schedule */}
            <form.Field
              name="frequency"
              children={(freqField) => (
                <form.Field
                  name="customDays"
                  children={(daysField) => (
                    <form.Field
                      name="targetCount"
                      children={(countField) => {
                        const freq = freqField.state.value
                        return (
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Schedule
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {FREQUENCIES.map((f) => (
                                <button
                                  key={f.value}
                                  type="button"
                                  onClick={() =>
                                    freqField.handleChange(f.value)
                                  }
                                  className={cn(
                                    'px-3 py-1 rounded-lg text-xs font-bold transition-all border',
                                    freq === f.value
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'border-border/50 text-muted-foreground hover:border-primary/50',
                                  )}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>
                            {(freq === 'weekly' ||
                              freq === 'custom' ||
                              freq === 'monthly') && (
                              <div className="flex flex-col gap-2 pt-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                  On specific days (optional):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {WEEKDAYS.map((day) => (
                                    <button
                                      key={day.value}
                                      type="button"
                                      onClick={() => {
                                        const prev = daysField.state.value
                                        daysField.handleChange(
                                          prev.includes(day.value)
                                            ? prev.filter(
                                                (d) => d !== day.value,
                                              )
                                            : [...prev, day.value],
                                        )
                                      }}
                                      className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border',
                                        daysField.state.value.includes(
                                          day.value,
                                        )
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : 'border-border/50 text-muted-foreground hover:border-primary/50',
                                      )}
                                    >
                                      {day.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(freq === 'weekly' || freq === 'monthly') &&
                              daysField.state.value.length === 0 && (
                                <div className="flex flex-col gap-2 pt-1">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                    Or set a target count (e.g. 3 times a week):
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={1}
                                      value={countField.state.value ?? ''}
                                      onChange={(e) =>
                                        countField.handleChange(
                                          e.target.value
                                            ? parseInt(e.target.value)
                                            : null,
                                        )
                                      }
                                      placeholder="Target count"
                                      className="w-32 bg-background/60 border-border/50"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      times a{' '}
                                      {freq === 'weekly' ? 'week' : 'month'}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        )
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Category + Priority + Interval */}
            <div className="flex flex-wrap gap-4">
              <form.Field
                name="interval"
                children={(field) => (
                  <form.Field
                    name="frequency"
                    children={(freqField) => (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Interval
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Every
                          </span>
                          <Input
                            type="number"
                            min={1}
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(
                                Math.max(1, parseInt(e.target.value) || 1),
                              )
                            }
                            className="w-20 bg-background/60 border-border/50"
                          />
                          <span className="text-sm text-muted-foreground capitalize">
                            {freqField.state.value === 'daily'
                              ? 'days'
                              : freqField.state.value === 'weekly'
                                ? 'weeks'
                                : freqField.state.value === 'monthly'
                                  ? 'months'
                                  : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                )}
              />

              <form.Field
                name="categoryId"
                children={(field) => (
                  <div className="space-y-1.5 flex-1 min-w-[150px]">
                    <Label className="text-xs text-muted-foreground">
                      Category
                    </Label>
                    <select
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="flex h-9 w-full rounded-md border border-border/50 bg-background/60 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                    >
                      <option value="">No Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />

              <form.Field
                name="priority"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Priority
                    </Label>
                    <div className="flex gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => field.handleChange(p.value)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-bold transition-all border',
                            field.state.value === p.value
                              ? p.color
                              : 'border-border/50 text-muted-foreground hover:border-primary/50',
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {!isEditing && (
        <div className="flex flex-wrap gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <Target className="w-3.5 h-3.5" />
            {consistency}% Consistency
          </div>
          <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <Fingerprint className="w-3.5 h-3.5" />
            {votes} Votes cast
          </div>
          <div className="text-muted-foreground bg-foreground/5 px-3 py-1.5 rounded-full capitalize border border-border/40">
            {scheduleLabel}
          </div>
        </div>
      )}

      {/* Tier descriptions (read-only mode) */}
      {!isEditing && (habit.miniDesc || habit.plusDesc || habit.eliteDesc) && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          {habit.miniDesc && (
            <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-1">
              <p className="font-bold text-sky-400/80 uppercase tracking-wider text-[9px]">
                2-Min Version
              </p>
              <p className="text-foreground">{habit.miniDesc}</p>
            </div>
          )}
          {habit.plusDesc && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
              <p className="font-bold text-primary/70 uppercase tracking-wider text-[9px]">
                Target Action
              </p>
              <p className="text-foreground">{habit.plusDesc}</p>
            </div>
          )}
          {habit.eliteDesc && (
            <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 space-y-1">
              <p className="font-bold text-amber-400/80 uppercase tracking-wider text-[9px]">
                Bonus Action
              </p>
              <p className="text-foreground">{habit.eliteDesc}</p>
            </div>
          )}
        </div>
      )}

      {/* Evidence log */}
      {habit.status === 'active' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>30-Day Evidence Log</span>
            <span className="opacity-60 normal-case font-medium">
              Tap a day to log your effort
            </span>
          </div>

          {/* Tier legend */}
          <div className="flex flex-wrap gap-2.5 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500/60 inline-block" />
              2-Min
            </span>
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              Target
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Bonus
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-foreground/15 inline-block" />
              Forgiven
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {getDailyActivityWindow().map((dayStr) => {
              const tier = completions.get(dayStr)
              const dateObj = fromLocalDateString(dayStr)
              return (
                <IdentityDayCell
                  key={dayStr}
                  dayStr={dayStr}
                  isCompleted={!!tier}
                  tier={tier as HabitTier}
                  isToday={dayStr === today}
                  activeOnDate={isScheduledOn(
                    dayStr,
                    habit.frequency,
                    habit.interval,
                    habit.daysOfWeek,
                    habit.createdAt.toISOString().split('T')[0],
                  )}
                  dateLabel={format(dateObj, 'MMM d')}
                  dayNumber={dateObj.getDate()}
                  onToggle={(day, selectedTier) =>
                    onToggleCompletion(habit.id, day, selectedTier)
                  }
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
