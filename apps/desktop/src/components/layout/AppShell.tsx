import { Outlet, useRouterState } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRef, useEffect } from 'react'
import { Background } from './Background'
import { Navbar } from './Navbar'
import { useMoodContext, MoodProvider } from '#/contexts/mood-context'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'
import { OnboardingFlow } from './OnboardingFlow'
import { LockScreen } from './LockScreen'
import { sessionStore } from '#/lib/session-store'
import { useUIStore } from '#/stores/ui-store'
import type { UserPreferences } from '#/types'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

function AppShellContent({ prefs }: { prefs: UserPreferences }) {
  const mood = useMoodContext()
  const pinSessionUnlocked = useUIStore((s) => s.pinSessionUnlocked)
  const unlockPinSession = useUIStore((s) => s.unlockPinSession)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isPending = useRouterState({ select: (s) => s.status === 'pending' })
  const { location } = useRouterState()

  useEffect(() => {
    if (!isPending && prefs.layoutMode !== 'immersive') {
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, isPending, prefs.layoutMode])

  if (!prefs.onboardedAt && !prefs.disclaimerAgreed) {
    return <OnboardingFlow />
  }

  const pinLocked =
    !import.meta.env.VITE_DEMO_MODE && !!prefs.privacyPin && !pinSessionUnlocked

  if (pinLocked) {
    return (
      <LockScreen
        pin={prefs.privacyPin!}
        onUnlock={() => {
          sessionStore.setPinSessionUnlocked()
          unlockPinSession()
        }}
      />
    )
  }

  return (
    <main
      className={`h-dvh flex flex-col overflow-hidden theme-${mood} bg-background text-foreground`}
    >
      <Background mood={mood} />
      <Navbar />

      {/* This is the viewport-locked scroll container.
          overflow-y-auto here + FocusSection flex-1 min-h-0
          gives us a true "content scrolls, viewport doesn't" layout. */}
      <div
        ref={scrollAreaRef}
        className="flex-1 relative z-10 flex flex-col overflow-y-auto overflow-x-hidden"
      >
        <FeatureErrorBoundary
          className="flex flex-1 flex-col min-h-0 w-full"
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
