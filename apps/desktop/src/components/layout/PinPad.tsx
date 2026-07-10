import { useCallback } from 'react'
import { cn } from '#/lib/utils'
import { useEventListener } from '#/hooks/use-event-listener'

type PinPadProps = {
  value: string
  onChange: (next: string) => void
  onComplete?: (pin: string) => void
  error?: boolean
  errorMessage?: string
  maxLength?: number
  className?: string
}

export function PinPad({
  value,
  onChange,
  onComplete,
  error = false,
  errorMessage,
  maxLength = 4,
  className,
}: PinPadProps) {
  const handleDigit = useCallback(
    (digit: string) => {
      if (value.length >= maxLength) return
      const next = value + digit
      onChange(next)
      if (next.length === maxLength) {
        onComplete?.(next)
      }
    },
    [value, maxLength, onChange, onComplete],
  )

  const handleDelete = useCallback(() => {
    onChange(value.slice(0, -1))
  }, [value, onChange])

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) {
      handleDigit(e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleDelete()
    }
  })

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex justify-center gap-5 mb-2 h-4',
          error && 'animate-[lock-shake_0.4s_ease-in-out]',
        )}
        role="status"
        aria-live="polite"
      >
        {Array.from({ length: maxLength }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-200',
              i < value.length
                ? error
                  ? 'bg-destructive scale-110'
                  : 'bg-primary scale-110'
                : 'bg-border',
            )}
          />
        ))}
      </div>

      {error && errorMessage && (
        <p className="text-center text-sm text-destructive mb-6">
          {errorMessage}
        </p>
      )}
      {!error && <div className="mb-6" />}

      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleDigit(String(n))}
            className="h-14 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary text-xl font-medium transition-colors active:scale-95"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-14 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary text-xl font-medium transition-colors active:scale-95"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="h-14 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors active:scale-95"
          aria-label="Delete digit"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
