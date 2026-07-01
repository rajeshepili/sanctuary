import { useState } from 'react'
import { Lock, Unlock, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { PinPad } from './PinPad'

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

  const title =
    mode === 'enable'
      ? step === 1
        ? 'Choose a PIN'
        : 'Confirm PIN'
      : 'Enter current PIN'

  const description =
    mode === 'enable'
      ? step === 1
        ? 'Four digits — used to lock the app on startup.'
        : 'Enter the same PIN again.'
      : 'Required to turn off app lock.'

  const handlePinChange = (next: string) => {
    setError(false)
    if (step === 1) setPin(next)
    else setConfirmPin(next)
  }

  const handleComplete = (code: string) => {
    if (step === 1) {
      if (mode === 'enable') {
        window.setTimeout(() => setStep(2), 200)
      } else {
        onSubmit(code)
      }
      return
    }

    if (code === pin) {
      onSubmit(pin)
    } else {
      setError(true)
      window.setTimeout(() => {
        setConfirmPin('')
        setPin('')
        setStep(1)
        setError(false)
      }, 500)
    }
  }

  const currentValue = step === 1 ? pin : confirmPin

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-8 flex flex-col items-center max-w-sm w-full gap-0"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div
          className={`p-4 rounded-full mb-5 ${
            mode === 'enable'
              ? 'bg-primary/10 text-primary'
              : 'bg-amber-500/10 text-amber-600'
          }`}
        >
          {mode === 'enable' ? (
            <Lock className="w-7 h-7" />
          ) : (
            <Unlock className="w-7 h-7" />
          )}
        </div>

        <h2 className="text-xl font-bold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">{description}</p>

        <PinPad
          value={currentValue}
          onChange={handlePinChange}
          onComplete={handleComplete}
          error={error}
          errorMessage="PINs did not match — start over."
        />
      </DialogContent>
    </Dialog>
  )
}
