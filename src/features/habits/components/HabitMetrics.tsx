import { Card } from '#/components/ui/card'
import { Flame, Trophy, Activity, CheckCircle2 } from 'lucide-react'

interface HabitMetricsProps {
  totalHabits: number
  streakLeaderName: string
  maxStreakValue: number
  totalCompletionsCount: number
  consistencyScore: number
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
}

function MetricCard({ icon, label, value, subValue }: MetricCardProps) {
  return (
    <Card className="p-4 rounded-xl border border-border/60 bg-card/85 backdrop-blur-md flex items-center gap-4 shadow-sm">
      <div className="p-3 rounded-xl bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-0.5">
          {label}
        </div>
        <div className="text-xl font-bold truncate max-w-[150px] text-foreground">
          {value}
        </div>
        {subValue && (
          <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
            {subValue}
          </div>
        )}
      </div>
    </Card>
  )
}

export function HabitMetrics({
  totalHabits,
  streakLeaderName,
  maxStreakValue,
  totalCompletionsCount,
  consistencyScore,
}: HabitMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        icon={<CheckCircle2 className="w-5 h-5" />}
        label="Active Habits"
        value={totalHabits}
      />
      <MetricCard
        icon={<Flame className="w-5 h-5" />}
        label="Top Streak"
        value={<span className="text-sm">{streakLeaderName}</span>}
        subValue={maxStreakValue > 0 ? `${maxStreakValue} days` : undefined}
      />
      <MetricCard
        icon={<Trophy className="w-5 h-5" />}
        label="Total Completions"
        value={totalCompletionsCount}
      />
      <MetricCard
        icon={<Activity className="w-5 h-5" />}
        label="30-Day Consistency"
        value={`${consistencyScore}%`}
      />
    </div>
  )
}
