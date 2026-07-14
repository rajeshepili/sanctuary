import { useForm } from '@tanstack/react-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { Separator } from '#/components/ui/separator'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '#/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { categoriesQueryOptions } from '../subdomains/categories/categories.options'
import type { HabitFrequency, HabitPriority } from '#/types'
import { User2, Layers3, CalendarDays, Flame, Heart, Check } from 'lucide-react'
import { cn } from '#/lib/utils'

// ── Constants ────────────────────────────────────────────────────────────────

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Flexible' },
]

const PRIORITIES: {
  value: HabitPriority
  label: string
  active: string
  dot: string
}[] = [
  {
    value: 'low',
    label: 'Low',
    active:
      'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    active:
      'bg-amber-500/15 text-amber-600 border-amber-500/40 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  {
    value: 'high',
    label: 'High',
    active:
      'bg-rose-500/15 text-rose-600 border-rose-500/40 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
]

const WEEKDAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
]

// ── Sub-components ───────────────────────────────────────────────────────────

function StepLabel({
  icon: Icon,
  step,
  label,
}: {
  icon: React.ElementType
  step: number
  label: string
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Step {step} — {label}
      </span>
    </div>
  )
}

function ToggleChip({
  active,
  onClick,
  children,
  activeClass = 'bg-primary text-primary-foreground border-primary',
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  activeClass?: string
  className?: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      animate={{
        borderRadius: active ? '999px' : '10px',
        scale: active ? 1.04 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'relative px-3.5 py-1.5 text-xs font-semibold border transition-colors duration-150 cursor-pointer select-none',
        active
          ? activeClass
          : 'border-border/50 text-muted-foreground bg-background/60 hover:border-primary/40 hover:text-foreground',
        className,
      )}
    >
      {active && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="inline-flex mr-1"
        >
          <Check className="w-3 h-3" />
        </motion.span>
      )}
      {children}
    </motion.button>
  )
}

function DayChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      animate={{
        borderRadius: active ? '999px' : '8px',
        scale: active ? 1.08 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'w-10 h-10 flex items-center justify-center text-[11px] font-bold border transition-colors duration-150 cursor-pointer',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30'
          : 'border-border/50 text-muted-foreground bg-background/60 hover:border-primary/40',
      )}
    >
      {label}
    </motion.button>
  )
}

// ── Types ────────────────────────────────────────────────────────────────────

interface HabitFormValues {
  name: string
  identityLabel: string
  miniDesc: string
  plusDesc: string
  eliteDesc: string
  intention: string
  frequency: HabitFrequency
  interval: number
  customDays: number[]
  targetCount: number | null
  priority: HabitPriority
  categoryId: number | null
}

interface IdentityCreateFormProps {
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
    targetCount: number | null
    priority: HabitPriority
    categoryId: number | null
  }) => void
  onCancel: () => void
}

const defaultValues: HabitFormValues = {
  name: '',
  identityLabel: '',
  miniDesc: '',
  plusDesc: '',
  eliteDesc: '',
  intention: '',
  frequency: 'daily',
  interval: 1,
  customDays: [],
  targetCount: null,
  priority: 'medium',
  categoryId: null,
}

// ── Main Component ───────────────────────────────────────────────────────────

export function IdentityCreateForm({
  onCreate,
  onCancel,
}: IdentityCreateFormProps) {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions)

  const form = useForm({
    defaultValues,
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

      onCreate({
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
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-0"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          Adopt a New Identity
        </h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Decide who you wish to become, then prove it with a small daily
          action.
        </p>
      </div>

      {/* ── Section 1: Identity ─────────────────────────────────────────────── */}
      <StepLabel icon={User2} step={1} label="Your Identity" />

      <FieldGroup className="gap-3 mb-5">
        <form.Field
          name="identityLabel"
          children={(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-semibold"
              >
                Who do you wish to become?
              </FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder='"I am a runner" · "I am a mindful person"'
                className="bg-background/60 border-border/50"
              />
            </Field>
          )}
        />

        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) =>
              !value.trim() ? 'Daily action is required' : undefined,
          }}
          children={(field) => (
            <Field
              data-invalid={
                field.state.meta.errors.length > 0 ? true : undefined
              }
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-semibold"
              >
                Daily Action{' '}
                <span className="font-normal text-muted-foreground">
                  — the proof of your identity
                </span>
              </FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Put on my running shoes"
                className="bg-background/60 border-border/50"
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

        <form.Field
          name="intention"
          children={(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-semibold"
              >
                Your 'Why'{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Because I want to feel strong and capable"
                className="bg-background/60 border-border/50"
              />
            </Field>
          )}
        />
      </FieldGroup>

      <Separator className="mb-5" />

      {/* ── Section 2: Effort Levels ─────────────────────────────────────────── */}
      <StepLabel icon={Layers3} step={2} label="Effort Levels" />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {(
          [
            {
              name: 'miniDesc' as const,
              label: '2-Min Version',
              sublabel: 'Minimum',
              placeholder: 'e.g. Read 1 page',
              accent: 'border-l-emerald-400',
            },
            {
              name: 'plusDesc' as const,
              label: 'Target Action',
              sublabel: 'Goal',
              placeholder: 'e.g. Read 15 mins',
              accent: 'border-l-primary',
            },
            {
              name: 'eliteDesc' as const,
              label: 'Bonus Action',
              sublabel: 'Elite',
              placeholder: 'e.g. Read a chapter',
              accent: 'border-l-amber-400',
            },
          ] as const
        ).map((col) => (
          <form.Field
            key={col.name}
            name={col.name}
            children={(field) => (
              <div className={cn('space-y-1.5 pl-3 border-l-2', col.accent)}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-semibold"
                >
                  {col.label}
                </FieldLabel>
                <p className="text-[10px] text-muted-foreground -mt-0.5">
                  {col.sublabel}
                </p>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={col.placeholder}
                  className="bg-background/60 border-border/50 text-xs"
                />
              </div>
            )}
          />
        ))}
      </div>

      <Separator className="mb-5" />

      {/* ── Section 3: Schedule ─────────────────────────────────────────────── */}
      <StepLabel icon={CalendarDays} step={3} label="Schedule" />

      <form.Field
        name="frequency"
        children={(freqField) => (
          <form.Field
            name="customDays"
            children={(daysField) => (
              <form.Field
                name="targetCount"
                children={(countField) => (
                  <form.Field
                    name="interval"
                    children={(intervalField) => {
                      const freq = freqField.state.value
                      const showDayPicker =
                        freq === 'weekly' ||
                        freq === 'custom' ||
                        freq === 'monthly'
                      const showTargetCount =
                        (freq === 'weekly' || freq === 'monthly') &&
                        daysField.state.value.length === 0
                      const frequencyUnit =
                        freq === 'daily'
                          ? 'day(s)'
                          : freq === 'weekly'
                            ? 'week(s)'
                            : freq === 'monthly'
                              ? 'month(s)'
                              : ''

                      return (
                        <div className="space-y-3 mb-5">
                          {/* Frequency chips */}
                          <div className="flex flex-wrap gap-2">
                            {FREQUENCIES.map((f) => (
                              <ToggleChip
                                key={f.value}
                                active={freq === f.value}
                                onClick={() => freqField.handleChange(f.value)}
                              >
                                {f.label}
                              </ToggleChip>
                            ))}
                          </div>

                          {/* Interval row */}
                          {freq !== 'custom' && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs text-muted-foreground">
                                Repeat every
                              </span>
                              <Input
                                type="number"
                                min={1}
                                value={intervalField.state.value}
                                onChange={(e) =>
                                  intervalField.handleChange(
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  )
                                }
                                className="w-16 h-8 bg-background/60 border-border/50 text-center text-sm"
                              />
                              <span className="text-xs text-muted-foreground">
                                {frequencyUnit}
                              </span>
                            </div>
                          )}

                          {/* Day picker */}
                          <AnimatePresence>
                            {showDayPicker && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                  On specific days (optional)
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {WEEKDAYS.map((day) => (
                                    <DayChip
                                      key={day.value}
                                      active={daysField.state.value.includes(
                                        day.value,
                                      )}
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
                                      label={day.label}
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Target count */}
                          <AnimatePresence>
                            {showTargetCount && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                  Or set a target count
                                </p>
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
                                    placeholder="e.g. 3"
                                    className="w-20 h-8 bg-background/60 border-border/50 text-center text-sm"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    times a{' '}
                                    {freq === 'weekly' ? 'week' : 'month'}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }}
                  />
                )}
              />
            )}
          />
        )}
      />

      <Separator className="mb-5" />

      {/* ── Section 4: Details ──────────────────────────────────────────────── */}
      <StepLabel icon={Flame} step={4} label="Details" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Priority */}
        <form.Field
          name="priority"
          children={(field) => (
            <Field>
              <FieldLabel className="text-xs font-semibold">
                Priority
              </FieldLabel>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <ToggleChip
                    key={p.value}
                    active={field.state.value === p.value}
                    onClick={() => field.handleChange(p.value)}
                    activeClass={cn('border', p.active)}
                  >
                    <span
                      className={cn(
                        'inline-block w-1.5 h-1.5 rounded-full mr-1.5',
                        p.dot,
                      )}
                    />
                    {p.label}
                  </ToggleChip>
                ))}
              </div>
            </Field>
          )}
        />

        {/* Category */}
        <form.Field
          name="categoryId"
          children={(field) => (
            <Field>
              <FieldLabel className="text-xs font-semibold">
                Category
              </FieldLabel>
              <Select
                value={field.state.value?.toString() ?? ''}
                onValueChange={(v) =>
                  field.handleChange(v ? parseInt(v) : null)
                }
              >
                <SelectTrigger className="w-full rounded-xl border-border/50 bg-background/60">
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <form.Subscribe
        selector={(state) => state.values.name}
        children={(name) => (
          <div className="flex gap-2.5">
            <Button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 gap-2 font-semibold"
            >
              <Heart className="w-3.5 h-3.5" />
              Adopt Identity
              <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px] ml-1">
                ↵
              </Kbd>
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      />
    </form>
  )
}
