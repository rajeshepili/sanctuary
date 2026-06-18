import { memo, useState, useCallback } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'


type Tier = 'mini' | 'plus' | 'elite' | 'skipped'

const TIERS: {
  value: Tier
  label: string
  desc: string
  activeClass: string
  idleClass: string
}[] = [
  {
    value: 'mini',
    label: '2-Min',
    desc: 'Minimum dose',
    activeClass: 'bg-sky-500/20 text-sky-400 border-sky-400/40 ring-1 ring-sky-400/30',
    idleClass: 'text-sky-400 border-sky-400/20 hover:bg-sky-500/10',
  },
  {
    value: 'plus',
    label: 'Target',
    desc: 'Full habit done',
    activeClass: 'bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30',
    idleClass: 'text-primary border-primary/20 hover:bg-primary/10',
  },
  {
    value: 'elite',
    label: 'Bonus',
    desc: 'Above & beyond',
    activeClass: 'bg-amber-400/20 text-amber-400 border-amber-400/40 ring-1 ring-amber-400/30',
    idleClass: 'text-amber-400 border-amber-400/20 hover:bg-amber-400/10',
  },
  {
    value: 'skipped',
    label: 'Forgive',
    desc: 'Mark as forgiven',
    activeClass: 'bg-foreground/10 text-muted-foreground border-border/40 ring-1 ring-border/30',
    idleClass: 'text-muted-foreground border-border/30 hover:bg-foreground/5',
  },
]

interface HabitDayCellProps {
  dayStr: string
  isCompleted: boolean
  tier?: Tier
  isToday: boolean
  activeOnDate: boolean
  dateLabel: string
  dayNumber: number
  onToggle: (dayStr: string, tier: Tier) => void
}

export const HabitDayCell = memo(function HabitDayCellComponent({
  dayStr,
  isCompleted,
  tier,
  isToday,
  activeOnDate,
  dateLabel,
  dayNumber,
  onToggle,
}: HabitDayCellProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = useCallback(
    (selectedTier: Tier) => {
      // If same tier → treat as toggle-off (pass same tier, service handles removal)
      onToggle(dayStr, selectedTier)
      setOpen(false)
    },
    [dayStr, onToggle],
  )

  if (!activeOnDate) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center cursor-not-allowed select-none opacity-35"
            aria-label={`${dateLabel}: Off day`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{dateLabel}: Off-day</TooltipContent>
      </Tooltip>
    )
  }

  const tierStyles: Record<Tier, string> = {
    mini: 'bg-sky-500/50 text-white shadow-sm shadow-sky-500/20',
    plus: 'bg-primary text-primary-foreground shadow-sm shadow-primary/30',
    elite: 'bg-amber-400 text-amber-950 scale-110 shadow-md shadow-amber-400/40',
    skipped: 'bg-foreground/15 text-muted-foreground opacity-60',
  }

  const cellButton = (
    <button
      aria-pressed={isCompleted}
      aria-label={`${dateLabel}: ${isToday ? 'Today, ' : ''}${isCompleted ? `Completed (${tier})` : 'Not completed'}`}
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95
        ${
          isCompleted
            ? tierStyles[tier ?? 'plus']
            : isToday
              ? 'bg-primary/10 text-primary ring-2 ring-primary/40 ring-inset hover:bg-primary/20'
              : 'bg-foreground/4 text-muted-foreground/70 hover:bg-foreground/10 hover:text-foreground/60'
        }`}
    >
      {dayNumber}
    </button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {open ? (
        // When popover is open, render trigger without tooltip to avoid
        // controlled→uncontrolled switching warnings
        <PopoverTrigger asChild>{cellButton}</PopoverTrigger>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{cellButton}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="text-[11px] font-bold">{isToday ? 'Today' : dateLabel}</div>
            <div className="text-[10px] opacity-75">
              {isCompleted
                ? tier === 'skipped'
                  ? 'Skipped (Forgiven)'
                  : `${tier === 'mini' ? '2-Min' : tier === 'elite' ? 'Bonus' : 'Target'} ✓ — tap to change`
                : 'Tap to log effort'}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-44 p-2 rounded-2xl"
        // prevent the popover portal from losing focus to the outside
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1.5 pb-1.5">
          How did it go?
        </p>
        <div className="space-y-1">
          {TIERS.map((t) => {
            const isActive = isCompleted && tier === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => handleSelect(t.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                  isActive ? t.activeClass : `bg-transparent ${t.idleClass}`
                }`}
              >
                <span className="text-[11px] font-bold">{t.label}</span>
                <span className="text-[10px] text-muted-foreground">{t.desc}</span>
              </button>
            )
          })}

          {isCompleted && (
            <>
              <div className="h-px bg-border/40 mx-1 my-1" />
              <button
                type="button"
                onClick={() => {
                  // Pass current tier to service — same tier = toggle off
                  if (tier) onToggle(dayStr, tier)
                  setOpen(false)
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border/30 text-[10px] text-muted-foreground hover:bg-foreground/5 transition-all text-left"
              >
                Remove completion
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
})
