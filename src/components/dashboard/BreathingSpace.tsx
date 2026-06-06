import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, easeInOut } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Wind } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { IconButton } from '#/components/ui/icon-button'
import { Button } from '#/components/ui/button'
import { useLocalState } from '#/hooks/use-local-state'

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

const PHASE_CONFIG: Record<
  BreathPhase,
  {
    label: string
    instruction: string
    color: string
    glowColor: string
    scale: number
  }
> = {
  inhale: {
    label: 'Breathe In',
    instruction: 'Fill your lungs',
    color:
      'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    glowColor: 'bg-emerald-400',
    scale: 1.6,
  },
  'hold-in': {
    label: 'Hold',
    instruction: 'Hold your breath',
    color: 'bg-sky-500/20 border-sky-500/40 text-sky-600 dark:text-sky-400',
    glowColor: 'bg-sky-400',
    scale: 1.72,
  },
  exhale: {
    label: 'Breathe Out',
    instruction: 'Empty your lungs',
    color:
      'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400',
    glowColor: 'bg-amber-400',
    scale: 1.0,
  },
  'hold-out': {
    label: 'Hold',
    instruction: 'Rest before inhaling',
    color:
      'bg-indigo-500/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-400',
    glowColor: 'bg-indigo-400',
    scale: 0.9,
  },
}

export function BreathingSpace() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [duration, setDuration] = useLocalState('breathing-duration', 4)
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [soundEnabled, setSoundEnabled] = useLocalState('breathing-sound', true)
  const soundEnabledRef = useRef(soundEnabled)

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  const audioCtxRef = useRef<AudioContext | null>(null)

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext()
    }
  }

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [])

  const playChime = (freq = 440, type: OscillatorType = 'sine') => {
    if (!soundEnabledRef.current || !audioCtxRef.current) return
    try {
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 1.8)
    } catch (e) {
      console.warn('Web Audio chime failed', e)
    }
  }

  const PHASES: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out']
  const PHASE_FREQS = [440, 554.37, 659.25, 880] // A4, C#5, E5, A5

  useEffect(() => {
    if (!isActive) return

    let phaseIndex = 0
    let ticksLeft = duration

    setPhase(PHASES[0])
    setSecondsLeft(duration)
    playChime(PHASE_FREQS[0], 'triangle')

    const timer = setInterval(() => {
      ticksLeft -= 1

      if (ticksLeft <= 0) {
        phaseIndex = (phaseIndex + 1) % PHASES.length
        const nextPhase = PHASES[phaseIndex]

        setPhase(nextPhase)
        setSecondsLeft(duration)
        playChime(PHASE_FREQS[phaseIndex], 'triangle')
        ticksLeft = duration
      } else {
        setSecondsLeft(ticksLeft)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, duration])

  const handleToggle = () => {
    initAudio()
    if (!isActive) {
      setPhase('inhale')
      setSecondsLeft(duration)
    }
    setIsActive((prev) => !prev)
  }

  const currentConfig = PHASE_CONFIG[phase]

  return (
    <Card className="p-6 border border-border/60 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden flex flex-col items-center text-center gap-4">
      {/* Small Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/70">
          <Wind className="w-4 h-4 text-primary" />
          <span>Breathing Space</span>
        </div>

        <IconButton
          tooltip={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
          onClick={() => {
            initAudio()
            setSoundEnabled(!soundEnabled)
          }}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </IconButton>
      </div>

      {/* Main Breathing Circle Display */}
      <div className="h-44 flex items-center justify-center relative w-full">
        {/* Pulsing Ambient Background Glow */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className={`absolute w-28 h-28 rounded-full blur-2xl opacity-40 transition-colors duration-1000 ${currentConfig.glowColor}`}
              key={`glow-${phase}`}
              animate={{
                scale: currentConfig.scale,
                opacity:
                  phase === 'hold-in' || phase === 'hold-out' ? 0.25 : 0.45,
              }}
              transition={{
                duration:
                  phase === 'inhale' || phase === 'exhale' ? duration : 0.4,
                ease: easeInOut,
              }}
            />
          )}
        </AnimatePresence>

        {/* Breathing Orb */}
        <motion.div
          animate={{
            scale: isActive ? currentConfig.scale : 1,
          }}
          transition={{
            duration: phase === 'inhale' || phase === 'exhale' ? duration : 0.4,
            ease: easeInOut,
          }}
          className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-colors duration-1000 ${
            isActive
              ? currentConfig.color
              : 'bg-foreground/5 border-border/80 text-muted-foreground'
          } shadow-inner`}
        >
          {isActive ? (
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-2xl font-black font-mono">
                {secondsLeft}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                sec
              </span>
            </div>
          ) : (
            <Wind className="w-6 h-6 opacity-60" />
          )}
        </motion.div>
      </div>

      {/* Active Phase Label */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                {currentConfig.label}
              </h3>

              <p className="text-[11px] text-muted-foreground">
                {currentConfig.instruction}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle Description / Duration Adjuster */}
      <AnimatePresence mode="wait">
        {!isActive && (
          <motion.div
            key="idle-controls"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full flex flex-col items-center gap-2 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full text-base"
                onClick={() => setDuration((d) => Math.max(2, d - 1))}
              >
                -
              </Button>
              <p className="text-xs text-muted-foreground font-medium">
                {duration}s per phase
              </p>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full text-base"
                onClick={() => setDuration((d) => Math.min(10, d + 1))}
              >
                +
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Button */}
      <Button className="w-full" onClick={handleToggle}>
        {isActive ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span>Pause Session</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Begin Breathing</span>
          </>
        )}
      </Button>
    </Card>
  )
}
