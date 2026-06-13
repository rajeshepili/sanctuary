import { Link } from '@tanstack/react-router'
import { SanctuarySettings } from './SanctuarySettings'
import { usePreferencesQueries } from '#/features/preferences/preferences.queries'
import { usePreferencesMutations } from '#/features/preferences/preferences.mutations'
import { APP_NAME } from '#/config/branding'
import { useMoodContext } from '#/contexts/mood-context'
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  BookOpen,
  Home,
  BookMarked,
  Dumbbell,
  Sparkles,
} from 'lucide-react'

// Maps mood to a small contextual icon
function MoodIcon({ mood }: { mood: string }) {
  switch (mood) {
    case 'morning':
      return <Sunrise className="w-3.5 h-3.5" />
    case 'day':
      return <Sun className="w-3.5 h-3.5" />
    case 'evening':
      return <Sunset className="w-3.5 h-3.5" />
    case 'night':
      return <Moon className="w-3.5 h-3.5" />
    default:
      return null
  }
}

const NAV_ITEMS = [
  { to: '/' as const, label: 'Home', Icon: Home },
  { to: '/journal' as const, label: 'Journal', Icon: BookMarked },
  { to: '/habits' as const, label: 'Habits', Icon: Dumbbell },
  { to: '/prompts' as const, label: 'Prompts', Icon: Sparkles },
] as const

export function Navbar() {
  const { prefs } = usePreferencesQueries()
  const { updatePreferences } = usePreferencesMutations()
  const mood = useMoodContext()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-2.5 rounded-full border border-border/20 bg-background/20 backdrop-blur-xl shadow-lg hover:bg-background/60 hover:shadow-primary/5 transition-all duration-500 w-[90%] sm:w-auto sm:min-w-[600px]"
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm tracking-wide text-foreground/90">
          {APP_NAME}
        </span>
        <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-foreground/5 text-xs text-muted-foreground/70 font-medium">
          <MoodIcon mood={mood} />
          Good {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === '/' }}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            activeProps={{
              className:
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors text-primary bg-primary/8',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>

      {/* Settings */}
      <div className="flex items-center gap-2">
        <div className="w-px h-4 bg-border/60" />
        <SanctuarySettings prefs={prefs} onUpdatePrefs={updatePreferences} />
      </div>
    </nav>
  )
}
