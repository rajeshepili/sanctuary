import { Link } from '@tanstack/react-router'
import { SanctuarySettings } from './SanctuarySettings'
import { motion } from 'framer-motion'
import {
  Home,
  BookMarked,
  Dumbbell,
  Sparkles,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/' as const, label: 'Home', Icon: Home },
  { to: '/journal' as const, label: 'Journal', Icon: BookMarked },
  { to: '/habits' as const, label: 'Habits', Icon: Dumbbell },
  { to: '/prompts' as const, label: 'Prompts', Icon: Sparkles },
] as const

export function Navbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 pointer-events-none">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          damping: 20, 
          stiffness: 150,
          mass: 1
        }}
        aria-label="Main navigation"
        className="pointer-events-auto flex items-center justify-between gap-4 px-6 py-2.5 rounded-full border border-border/20 bg-background/40 backdrop-blur-2xl shadow-2xl hover:bg-background/80 transition-colors duration-300 w-auto cursor-default"
      >
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

        <div className="flex items-center gap-2">
          <div className="w-px h-4 bg-border/60" />
          <SanctuarySettings />
        </div>
      </motion.nav>
    </div>
  )
}
