import { Target, Fingerprint, Moon, Sun, Trash2, AlertTriangle } from 'lucide-react'
import { IconButton } from '#/components/ui/icon-button'
import { HabitDayCell } from '#/features/habits/components/HabitDayCell'
import { isScheduledOn } from '#/utils/consistency'
import { getLast30DaysList, fromLocalDateString } from '#/utils/date'
import { formatScheduleLabel } from '#/utils/habits'
import { format } from 'date-fns'
import type { Habit } from '#/types'

interface HabitDetailViewProps {
  habit: Habit
  completions: Map<string, string>
  consistency: number
  votes: number
  today: string
  missedYesterday: boolean
  onUpdateStatus: (id: number, status: 'active' | 'resting') => void
  onDelete: (id: number) => void
  onToggleCompletion: (id: number, day: string, tier?: 'mini' | 'plus' | 'elite') => void
}

export function HabitDetailView({
  habit,
  completions,
  consistency,
  votes,
  today,
  missedYesterday,
  onUpdateStatus,
  onDelete,
  onToggleCompletion,
}: HabitDetailViewProps) {
  const scheduleLabel = formatScheduleLabel(habit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border/40 pb-5">
        <div className="space-y-1.5">
          <h2 className={`text-2xl font-bold ${habit.status === 'resting' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {habit.identityLabel ?? habit.name}
          </h2>
          {habit.identityLabel && (
            <div className="flex items-center gap-1.5 text-sm text-primary/80 font-semibold">
              <Target className="w-4 h-4" />
              <span>Daily Action: {habit.name}</span>
            </div>
          )}
          {habit.intention && (
            <p className="text-sm italic text-muted-foreground font-serif border-l-2 border-primary/30 pl-3 mt-2">
              "{habit.intention}"
            </p>
          )}
          {missedYesterday && habit.status === 'active' && (
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 uppercase tracking-widest mt-1">
              <AlertTriangle className="w-3 h-3" />
              Never Miss Twice
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-4">
          <IconButton
            tooltip={habit.status === 'active' ? 'Rest this habit' : 'Resume this habit'}
            onClick={() => onUpdateStatus(habit.id, habit.status === 'active' ? 'resting' : 'active')}
          >
            {habit.status === 'active' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </IconButton>
          <IconButton tooltip="Delete this identity" variant="danger" onClick={() => onDelete(habit.id)}>
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {/* Stats */}
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

      {/* Tier descriptions */}
      {(habit.miniDesc || habit.plusDesc || habit.eliteDesc) && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          {habit.miniDesc && (
            <div className="p-3 rounded-xl bg-foreground/5 border border-border/40 space-y-1">
              <p className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">2-Minute Version</p>
              <p className="text-foreground">{habit.miniDesc}</p>
            </div>
          )}
          {habit.plusDesc && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
              <p className="font-bold text-primary/70 uppercase tracking-wider text-[9px]">Target Action</p>
              <p className="text-foreground">{habit.plusDesc}</p>
            </div>
          )}
          {habit.eliteDesc && (
            <div className="p-3 rounded-xl bg-foreground/5 border border-border/40 space-y-1">
              <p className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Bonus Action</p>
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
            <span className="opacity-60 normal-case font-medium">Tap to cast a vote</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {getLast30DaysList().map((dayStr) => {
              const tier = completions.get(dayStr)
              const dateObj = fromLocalDateString(dayStr)
              return (
                <HabitDayCell
                  key={dayStr}
                  dayStr={dayStr}
                  isCompleted={!!tier}
                  tier={tier as 'mini' | 'plus' | 'elite'}
                  isToday={dayStr === today}
                  activeOnDate={isScheduledOn(dayStr, habit.frequency, habit.daysOfWeek)}
                  dateLabel={format(dateObj, 'MMM d')}
                  dayNumber={dateObj.getDate()}
                  onToggle={(day) => onToggleCompletion(habit.id, day)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
