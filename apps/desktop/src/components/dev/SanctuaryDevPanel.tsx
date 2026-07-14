import { useUIStore } from '#/stores/ui-store'
import { Sun, Moon, Cloud, Sunrise, Clock, Bug } from 'lucide-react'
import { Button } from '#/components/ui/button'
import type { ThemeMood } from '#/types'
import { toast } from 'sonner'

export function SanctuaryDevPanel() {
  const { forcedMood, setForcedMood } = useUIStore()

  const moods: { label: string; value: ThemeMood | null; icon: any }[] = [
    { label: 'Auto', value: null, icon: Clock },
    { label: 'Morning', value: 'morning', icon: Sunrise },
    { label: 'Day', value: 'day', icon: Sun },
    { label: 'Evening', value: 'evening', icon: Cloud },
    { label: 'Night', value: 'night', icon: Moon },
  ]

  const handleMoodChange = (mood: ThemeMood | null) => {
    setForcedMood(mood)
    toast.info(
      mood ? `Theme forced to: ${mood}` : 'Theme reset to automatic.',
      {
        duration: 1500,
      },
    )
  }

  return (
    <div className="p-4 space-y-4 min-w-[280px]">
      <div className="space-y-1">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Bug className="w-4 h-4 text-primary" />
          Theme Simulation
        </h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Override aesthetic mood for testing
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {moods.map((m) => {
          const Icon = m.icon
          const active = forcedMood === m.value
          return (
            <Button
              key={m.label}
              variant={active ? 'default' : 'outline'}
              size="sm"
              className="flex-col h-14 gap-1 p-0 transition-all"
              onClick={() => handleMoodChange(m.value)}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold">{m.label}</span>
            </Button>
          )
        })}
      </div>

      <div className="pt-2 border-t border-border/10">
        <p className="text-[9px] text-center text-muted-foreground italic">
          Only available in development.
        </p>
      </div>
    </div>
  )
}
