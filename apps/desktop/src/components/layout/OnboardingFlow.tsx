import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import {
  Sparkles,
  ArrowRight,
  Heart,
  Lock,
  Archive,
  FolderOpen,
  LayoutTemplate,
  Zap,
} from 'lucide-react'
import { usePreferencesMutations } from '#/features/preferences/preferences.mutations'
import { APP_NAME } from '#/config/branding'
import { Input } from '#/components/ui/input'
import type { UpdatePreferencesInput } from '#/features/preferences/preferences.schema'

const BACKUP_FREQUENCIES = [
  { value: 'daily' as const, label: 'Daily', desc: 'While the app is open.' },
  { value: 'weekly' as const, label: 'Weekly', desc: 'Once every seven days.' },
  {
    value: 'manual' as const,
    label: 'Manual',
    desc: "I'll back up from Settings.",
  },
]

const LAYOUT_OPTIONS = [
  {
    value: 'standard' as const,
    label: 'Compact header',
    desc: 'Scene stays in the background. Content starts near the top.',
  },
  {
    value: 'immersive' as const,
    label: 'Full-screen scene',
    desc: 'Landscape fills the screen first — scroll down to write.',
  },
]

type OnboardingPath = 'choose' | 'quick' | 'full'

export function OnboardingFlow() {
  const { updatePreferences } = usePreferencesMutations()
  const navigate = useNavigate()

  const [path, setPath] = useState<OnboardingPath>('choose')
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [pin, setPin] = useState('')
  const [layoutMode, setLayoutMode] = useState<'standard' | 'immersive'>(
    'standard',
  )
  const [backupFrequency, setBackupFrequency] = useState<
    'daily' | 'weekly' | 'manual'
  >('weekly')
  const [backupPath, setBackupPath] = useState<string | null>(null)
  const [defaultBackupDir, setDefaultBackupDir] = useState(
    '~/Documents/Sanctuary Backups',
  )

  const fullSteps = 4

  useEffect(() => {
    if (window.sanctuary?.getBackupDir) {
      void window.sanctuary.getBackupDir().then(setDefaultBackupDir)
    }
  }, [])

  const finish = useCallback(
    async (patch: UpdatePreferencesInput = {}) => {
      try {
        await updatePreferences.mutateAsync({
          firstName: firstName.trim() || undefined,
          disclaimerAgreed: true,
          layoutMode,
          backupFrequency: path === 'quick' ? 'manual' : backupFrequency,
          backupEnabled:
            path === 'quick' ? false : backupFrequency !== 'manual',
          backupPath: backupPath || null,
          backupKeepCount: 30,
          privacyPin: pin.length === 4 ? pin : undefined,
          ...patch,
        })
        navigate({ to: '/' })
      } catch {
        // toast handled in mutation
      }
    },
    [
      updatePreferences,
      firstName,
      layoutMode,
      path,
      backupFrequency,
      backupPath,
      pin,
      navigate,
    ],
  )

  const handlePinInput = (val: string) => {
    if (pin.length < 4 && /^\d+$/.test(val)) setPin(pin + val)
  }

  if (path === 'choose') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-8 space-y-6 rounded-3xl">
          <div className="space-y-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Welcome to {APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">
              A private journal on your computer. Pick how much setup you want
              right now — you can change everything later in Settings.
            </p>
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => void finish()}
              className="text-left p-4 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Zap className="w-4 h-4 text-primary" /> Quick start
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Jump straight in. Configure backups and layout later.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setPath('full')
                setStep(1)
              }}
              className="text-left p-4 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <LayoutTemplate className="w-4 h-4 text-primary" /> Full setup
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Name, backups, layout, optional PIN.
              </p>
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg p-8 space-y-6 rounded-3xl">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          Full setup · Step {step} of {fullSteps}
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">What should we call you?</h2>
            <p className="text-sm text-muted-foreground">
              Optional — skip if you prefer.
            </p>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your name"
              className="h-11"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Archive className="w-5 h-5 text-emerald-500" /> Automatic backups
            </h2>
            <p className="text-sm text-muted-foreground">
              JSON copies saved to a folder on your computer while the app is
              running.
            </p>
            <div className="space-y-2">
              {BACKUP_FREQUENCIES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBackupFrequency(opt.value)}
                  className={`w-full text-left p-3 rounded-lg border text-sm ${
                    backupFrequency === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50'
                  }`}
                >
                  <span className="font-bold">{opt.label}</span>
                  <span className="text-muted-foreground"> — {opt.desc}</span>
                </button>
              ))}
            </div>
            {backupFrequency !== 'manual' && (
              <div className="flex gap-2 items-center">
                <code className="flex-1 text-xs p-2 rounded bg-muted truncate">
                  {backupPath ?? defaultBackupDir}
                </code>
                {window.sanctuary?.selectBackupDir && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      const d = await window.sanctuary!.selectBackupDir()
                      if (d) setBackupPath(d)
                    }}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Choose your layout</h2>
            <div className="space-y-2">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLayoutMode(opt.value)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    layoutMode === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50'
                  }`}
                >
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5" /> Optional PIN
            </h2>
            <p className="text-sm text-muted-foreground">
              Locks the app when opened. Skip to add later.
            </p>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 ${
                    pin.length > i
                      ? 'bg-primary border-primary'
                      : 'border-muted'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((n) => (
                <Button
                  key={String(n)}
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    if (n === 'C') setPin('')
                    else if (n === '⌫') setPin((p) => p.slice(0, -1))
                    else handlePinInput(String(n))
                  }}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border/30">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (step === 1) setPath('choose')
              else setStep((s) => s - 1)
            }}
          >
            Back
          </Button>

          {step < fullSteps ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={() => void finish()}>
              <Heart className="w-4 h-4 mr-1" /> Open {APP_NAME}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
