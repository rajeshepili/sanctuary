import { Link } from '@tanstack/react-router'
import { SanctuarySettings } from './SanctuarySettings'
import { Home, BookMarked, Dumbbell } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/journal', label: 'Journal', Icon: BookMarked },
  { to: '/habits', label: 'Identities', Icon: Dumbbell },
] as const

export function Navbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
      <nav
        aria-label="Main navigation"
        className="pointer-events-auto flex items-center justify-between gap-4 px-5 py-2 rounded-full border border-white/10 bg-background/75 backdrop-blur-2xl shadow-2xl w-auto ring-1 ring-inset ring-white/5"
      >
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              preload="intent"
              activeOptions={{ exact: to === '/' }}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              activeProps={{
                className:
                  'relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 text-primary bg-primary/10',
              }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-px h-4 bg-foreground/10" />
          <SanctuarySettings />
        </div>
      </nav>
    </div>
  )
}
