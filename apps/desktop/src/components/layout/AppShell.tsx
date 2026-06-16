import { Outlet } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Background } from './Background'
import { Navbar } from './Navbar'
import { useMoodContext, MoodProvider } from '#/contexts/mood-context'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'
import { OnboardingFlow } from './OnboardingFlow'
import { LockScreen } from './LockScreen'
import { useEffect } from 'react'
import { useUIStore } from '#/stores/ui-store'
import type { UserPreferences } from '#/types'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

function AppShellContent({ prefs }: { prefs: UserPreferences }) {
  const mood = useMoodContext()
  const { isLocked, setLocked } = useUIStore()

  useEffect(() => {
    if (prefs.privacyPin) {
      setLocked(true)
    } else {
      setLocked(false)
    }
  }, [prefs.privacyPin, setLocked])

  if (!prefs.disclaimerAgreed) {
    return <OnboardingFlow />
  }

  if (prefs.privacyPin && isLocked) {
    return (
      <LockScreen pin={prefs.privacyPin} onUnlock={() => setLocked(false)} />
    )
  }

  return (
    <main
      className={`relative min-h-dvh flex flex-col theme-${mood} bg-background text-foreground transition-colors duration-700`}
    >
      <Background mood={mood} />

      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="flex-1 relative z-10 mt-20">
        <FeatureErrorBoundary
          className="max-w-4xl mx-auto"
          title="Page Error"
          message="The page could not be loaded correctly."
        >
          <Outlet />
        </FeatureErrorBoundary>
      </div>
    </main>
  )
}

export function AppShell() {
  const { data: prefs } = useSuspenseQuery(preferencesQueryOptions())

  return (
    <MoodProvider lat={prefs.latitude} lng={prefs.longitude}>
      <AppShellContent prefs={prefs} />
    </MoodProvider>
  )
}
