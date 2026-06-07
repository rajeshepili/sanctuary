import { memo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

interface HabitDayCellProps {
  dayStr: string
  isCompleted: boolean
  isToday: boolean
  activeOnDate: boolean
  dateLabel: string
  dayNumber: number
  onToggle: (dayStr: string) => void
}

export const HabitDayCell = memo(function HabitDayCellComponent({
  dayStr,
  isCompleted,
  isToday,
  activeOnDate,
  dateLabel,
  dayNumber,
  onToggle,
}: HabitDayCellProps) {
  if (!activeOnDate) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center cursor-not-allowed select-none opacity-40"
            aria-label={`${dateLabel}: Off day`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{dateLabel}: Off-day</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onToggle(dayStr)}
          aria-pressed={isCompleted}
          aria-label={`${dateLabel}: ${isCompleted ? 'Completed' : 'Not completed'}`}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all duration-300 cursor-pointer select-none active:scale-95
            ${
              isCompleted
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : isToday
                  ? 'bg-primary/10 text-primary ring-2 ring-primary/40 ring-inset hover:bg-primary/20'
                  : 'bg-foreground/4 text-muted-foreground/80 hover:bg-foreground/8'
            }`}
        >
          {dayNumber}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {dateLabel}:{' '}
        {isCompleted ? 'Completed ✓' : isToday ? 'Today' : 'Not completed'}
      </TooltipContent>
    </Tooltip>
  )
})
