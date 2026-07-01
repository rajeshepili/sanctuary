import { useState, useCallback } from 'react'
import { Lock } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { verifyPin } from '#/utils/crypto'
import { PinPad } from './PinPad'

export function LockScreen({
  pin,
  onUnlock,
}: {
  pin: string
  onUnlock: () => void
}) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleComplete = useCallback(
    async (code: string) => {
      const isValid = await verifyPin(code, pin)
      if (isValid) {
        onUnlock()
        return
      }
      setError(true)
      window.setTimeout(() => {
        setInput('')
        setError(false)
      }, 500)
    },
    [pin, onUnlock],
  )

  return (
    <div className="fixed inset-0 z-100 grid place-items-center p-4 bg-background">
      <Card className="p-8 flex flex-col items-center max-w-sm w-full border-border/50 shadow-xl">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-5">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight mb-1">Locked</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Enter your PIN to open Sanctuary.
        </p>

        <PinPad
          value={input}
          onChange={setInput}
          onComplete={handleComplete}
          error={error}
          errorMessage="Wrong PIN — try again."
        />

        <p className="mt-8 text-[11px] text-muted-foreground text-center leading-relaxed">
          No recovery email exists. If you forget your PIN, you can reset it via
          the database — see the user guide.
        </p>
      </Card>
    </div>
  )
}
