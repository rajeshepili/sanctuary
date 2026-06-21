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
  Unlock,
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
  const [pin, setPin] = useState('')

  const totalSteps = 5

  const handleFinish = async () => {
    if (!agreed) return
    try {
      await updatePreferences.mutateAsync({
        firstName: firstName.trim() || undefined,
        ...selections,
        privacyPin: pin.length === 4 ? pin : undefined,
        disclaimerAgreed: true,
      })
      navigate({ to: '/' })
    } catch {
      // Error is handled by global toast.error in mutation
    }
  }

  const toggleFeature = (id: string) => {
    setSelections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handlePinInput = (val: string) => {
    if (pin.length < 4 && /^\d+$/.test(val)) {
      setPin(pin + val)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [-20, 20, -20],
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-radial-gradient from-primary/15 to-transparent pointer-events-none opacity-50"
        />
      </div>

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
            <div className="flex gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
              <span>Welcome</span>
              <span className="opacity-40">/</span>
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
                  How would you like to be called? You can skip this if you'd
                  like.
                </p>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your name (optional)"
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
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Data Privacy
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Please read and acknowledge how your data is handled:
                </p>

                <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Local Data Only</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sanctuary is a local-only application. Your data never
                    leaves your device, and there are no cloud backups or
                    account recovery options.
                  </p>
                  <p className="text-[11px] text-foreground/90 font-semibold leading-relaxed">
                    By using this app, you acknowledge that you are solely
                    responsible for backing up your own data. If you lose your
                    device or uninstall the app without a backup, your data will
                    be permanently lost.
                  </p>
                </div>

                <div className="flex items-start space-x-3 mt-6">
                  <Label className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:bg-foreground/5 transition-colors cursor-pointer select-none group">
                    <Checkbox
                      id="agreed"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(!!checked)}
                      className="mt-1 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider transition-colors group-hover:text-amber-600">
                        I understand the risks
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight normal-case font-medium">
                        I acknowledge that my data is saved only on this device
                        and cannot be recovered if lost.
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Secure Your Sanctuary
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-center px-8">
                  Add a 4-digit PIN to protect your reflections. You can skip
                  this and add it later in Settings.
                </p>

                <div className="flex flex-col items-center gap-8 py-4">
                  <div className="flex gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                          pin.length > i
                            ? 'bg-primary border-primary scale-110 shadow-[0_0_15px_rgba(var(--primary),0.4)]'
                            : 'border-border/60 bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <button
                        key={n}
                        onClick={() => handlePinInput(n.toString())}
                        className="h-12 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-xl font-medium transition-all active:scale-90 cursor-pointer border border-transparent hover:border-primary/20"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPin('')}
                      className="h-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all text-xs font-bold uppercase tracking-widest cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handlePinInput('0')}
                      className="h-12 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-xl font-medium transition-all active:scale-90 cursor-pointer border border-transparent hover:border-primary/20"
                    >
                      0
                    </button>
                    {pin.length > 0 ? (
                      <button
                        onClick={() => setPin(pin.slice(0, -1))}
                        className="h-12 rounded-xl text-muted-foreground hover:bg-foreground/10 transition-all text-xs font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Del
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>

                  {pin.length === 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest"
                    >
                      <Check className="w-4 h-4" />
                      PIN Set
                    </motion.div>
                  )}
                  {pin.length === 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                      <Unlock className="w-4 h-4" />
                      No PIN (Unlocked)
                    </div>
                  )}
                </div>
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
                  disabled={step === 4 && !agreed}
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
