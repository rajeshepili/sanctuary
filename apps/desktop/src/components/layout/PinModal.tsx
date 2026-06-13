import { useState } from 'react'
import { Lock, Unlock, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { useEventListener } from '#/hooks/use-event-listener'

export function PinModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: 'enable' | 'disable'
  onClose: () => void
  onSubmit: (pin: string) => void
}) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const handleInput = (val: string) => {
    setError(false)
    if (step === 1) {
      if (pin.length < 4) {
        const next = pin + val
        setPin(next)
        if (next.length === 4) {
          if (mode === 'enable') {
            setTimeout(() => setStep(2), 250)
          } else {
            onSubmit(next)
          }
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const next = confirmPin + val
        setConfirmPin(next)
        if (next.length === 4) {
          if (next === pin) {
            onSubmit(pin)
          } else {
            setError(true)
            setIsShaking(true)
            setTimeout(() => setIsShaking(false), 400)
            setTimeout(() => {
              setConfirmPin('')
              setPin('')
              setStep(1)
            }, 600)
          }
        }
      }
    }
  }

  const handleDelete = () => {
    setError(false)
    if (step === 1) {
      setPin((p) => p.slice(0, -1))
    } else {
      setConfirmPin((p) => p.slice(0, -1))
    }
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) {
      handleInput(e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleDelete()
    }
  })

  const currentInput = step === 1 ? pin : confirmPin
  const title =
    mode === 'enable'
      ? step === 1
        ? 'Enter new PIN'
        : 'Confirm new PIN'
      : 'Enter current PIN'
  const description =
    mode === 'enable'
      ? step === 1
        ? 'Choose a 4-digit security code'
        : 'Please enter it one more time'
      : 'Verify identity to disable lock'

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-8 flex flex-col items-center bg-card/95 border-border/40 rounded-4xl shadow-2xl max-w-sm w-full gap-0 overflow-hidden"
      >
        <style>{`
          @keyframes modal-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: modal-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative mb-6 mt-2">
          <div
            className={`absolute inset-0 blur-xl rounded-full animate-pulse ${mode === 'enable' ? 'bg-primary/20' : 'bg-amber-500/20'}`}
          />
          <div
            className={`relative p-5 rounded-full border shadow-inner ${
              mode === 'enable'
                ? 'bg-gradient-to-br from-background to-primary/10 border-primary/20 text-primary'
                : 'bg-gradient-to-br from-background to-amber-500/10 border-amber-500/20 text-amber-500'
            }`}
          >
            {mode === 'enable' ? (
              <Lock className="w-8 h-8" />
            ) : (
              <Unlock className="w-8 h-8" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2 text-center text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mb-10 text-center px-4">
          {description}
        </p>

        <div
          className={`flex gap-6 mb-10 h-4 ${isShaking ? 'animate-shake' : ''}`}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                i < currentInput.length
                  ? error
                    ? 'bg-destructive scale-125 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                    : 'bg-primary scale-125 shadow-[0_0_12px_rgba(var(--primary),0.5)]'
                  : 'bg-border/50'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleInput(n.toString())}
              className="h-16 rounded-2xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-2xl font-medium transition-all active:scale-95 cursor-pointer shadow-sm border border-transparent hover:border-primary/20"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleInput('0')}
            className="h-16 rounded-2xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-2xl font-medium transition-all active:scale-95 cursor-pointer shadow-sm border border-transparent hover:border-primary/20"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-medium text-sm active:scale-95 cursor-pointer border border-transparent hover:border-destructive/20"
          >
            Del
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
