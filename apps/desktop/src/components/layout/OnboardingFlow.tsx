import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import {
  Sparkles,
  BookOpen,
  Wind,
  ShieldAlert,
  Check,
  ArrowRight,
  Heart,
  Calendar,
  Lock,
} from 'lucide-react'
import { usePreferencesMutations } from '#/features/preferences/preferences.mutations'
import { APP_NAME } from '#/config/branding'
import { Input } from '#/components/ui/input'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'

const features = [
  {
    id: 'showDailyIntention',
    label: 'Daily Intention',
    desc: 'Set a focus for your day to anchor your mindset.',
    icon: Sparkles,
  },
  {
    id: 'showHabits',
    label: 'Habit Tracker',
    desc: 'Build and track habits with streak-aware scheduling.',
    icon: Calendar,
  },
  {
    id: 'showPromptInspire',
    label: 'Inspiration Prompts',
    desc: 'Get reflective writing prompts to spark thought.',
    icon: BookOpen,
  },
  {
    id: 'showBreathingSpace',
    label: 'Breathing Space',
    desc: 'An animated box-breathing guide for present focus.',
    icon: Wind,
  },
] as const

export function OnboardingFlow() {
  const { updatePreferences } = usePreferencesMutations()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [selections, setSelections] = useState<Record<string, boolean>>({
    showDailyIntention: true,
    showHabits: true,
    showPromptInspire: true,
    showBreathingSpace: true,
  })
  const [agreed, setAgreed] = useState(false)

  const totalSteps = 4

  const handleFinish = async () => {
    if (!agreed) return
    await updatePreferences({
      firstName: firstName.trim() || undefined,
      ...selections,
      disclaimerAgreed: true,
    })
    navigate({ to: '/' })
  }

  const toggleFeature = (id: string) => {
    setSelections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background text-foreground p-4 relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-xl relative z-10"
        >
          <Card
            className="
            p-8 rounded-3xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl
            flex flex-col space-y-6 relative overflow-hidden
          "
          >
            {/* Step counter */}
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">
              <span>Welcome</span>
              <span>
                Step {step} of {totalSteps}
              </span>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Welcome to <br />
                  {APP_NAME}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A completely private, zero-pressure space for reflection. No
                  gamification, no leaderboards — just you and your thoughts.
                </p>
                <div className="p-4 rounded-2xl border border-border/40 bg-foreground/1 text-xs text-muted-foreground leading-relaxed italic">
                  "Progress is not about moving faster; it is about staying
                  present along the way."
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Personalize Your Space
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  What should we call you? This is completely optional.
                </p>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name (optional)"
                  className="w-full h-12 px-4 rounded-xl bg-card/50 border-border/50"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && setStep(3)}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Your Dashboard
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose the tools you want on your dashboard. You can always
                  change these later in Settings.
                </p>

                <div className="space-y-3 pt-1">
                  {features.map((f) => {
                    const Icon = f.icon
                    const active = selections[f.id]
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFeature(f.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group ${
                          active
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border/50 bg-card/50 hover:border-primary/30'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg shrink-0 transition-colors ${
                            active
                              ? 'bg-primary/10 text-primary'
                              : 'bg-foreground/5 text-muted-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold ${active ? 'text-foreground' : 'text-foreground/70'}`}
                          >
                            {f.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {f.desc}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {active && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Terms of Use
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Before you enter the sanctuary, please read and acknowledge
                  our legal disclaimer:
                </p>

                {/* Glassmorphic waiver box */}
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/2 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Liability & Accountability Notice</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This platform is a local, private self-reflection journal
                    and tracking system provided solely for personal use.
                    Everything you write is stored on your device using a local
                    database. There is no cloud sync.
                  </p>
                  <p className="text-[11px] text-foreground/90 font-semibold leading-relaxed">
                    By accessing and using this application, you explicitly
                    agree that{' '}
                    <span className="underline">
                      any damage, data loss, or distress caused directly or
                      indirectly is your sole responsibility
                    </span>
                    . The author assumes absolutely no liability for your usage,
                    actions, and outcomes.
                  </p>
                </div>

                {/* Consent checkbox */}
                <Label className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:bg-foreground/5 transition-colors cursor-pointer select-none">
                  <Checkbox
                    id="agreed"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(!!checked)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                      I acknowledge and accept full responsibility
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight normal-case font-medium">
                      I agree that the developer is not responsible nor
                      accountable for any damage or outcomes of my usage.
                    </p>
                  </div>
                </Label>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-border/15">
              {step > 1 ? (
                <Button
                  onClick={() => setStep((s) => s - 1)}
                  variant="ghost"
                  className="px-4 py-2"
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-1 px-5 py-2.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!agreed}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Open {APP_NAME}</span>
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
