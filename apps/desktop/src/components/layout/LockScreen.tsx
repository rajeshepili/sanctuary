import { useState } from 'react'
import { Lock, ShieldAlert } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { hashPin } from '#/utils/crypto'
import { useEventListener } from '#/hooks/use-event-listener'

export function LockScreen({
  pin,
  onUnlock,
}: {
  pin: string
  onUnlock: () => void
}) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const handleInput = async (val: string) => {
    if (error) setError(false)
    const next = input + val
    if (next.length <= 4) {
      setInput(next)
      if (next.length === 4) {
        const hashed = await hashPin(next)
        if (hashed === pin || next === pin) {
          onUnlock()
        } else {
          setError(true)
          setIsShaking(true)
          setTimeout(() => setIsShaking(false), 400)
          setTimeout(() => setInput(''), 600)
        }
      }
    }
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) {
      handleInput(e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      setInput((prev) => prev.slice(0, -1))
      setError(false)
    }
  })

  return (
    <div className="fixed inset-0 z-100 grid place-items-center overflow-y-auto p-4 bg-background/80 backdrop-blur-3xl animate-in fade-in duration-500">
      <style>{`
        @keyframes lock-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: lock-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>

      <Card className="p-8 flex flex-col items-center bg-card/60 border border-border/40 rounded-4xl shadow-2xl max-w-sm w-full my-auto animate-in slide-in-from-bottom-8 duration-700 ease-out">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative p-5 rounded-full bg-gradient-to-br from-background to-primary/10 border border-primary/20 text-primary shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Sanctuary Locked
        </h2>
        <p className="text-sm text-muted-foreground mb-10 text-center px-4">
          Enter your 4-digit PIN to access your private journal.
        </p>

        <div
          className={`flex gap-6 mb-10 h-4 ${isShaking ? 'animate-shake' : ''}`}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                i < input.length
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
            onClick={() => {
              setInput(input.slice(0, -1))
              setError(false)
            }}
            className="h-16 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-medium text-sm active:scale-95 cursor-pointer border border-transparent hover:border-destructive/20"
          >
            ⌫
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 w-full">
          <details className="group">
            <summary className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 select-none">
              <ShieldAlert className="w-3.5 h-3.5" />
              Forgot your PIN?
            </summary>
            <div className="mt-4 p-4 bg-foreground/3 border border-border/50 rounded-2xl text-[11px] text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200">
              <p className="mb-2 leading-relaxed">
                Because Sanctuary is local-first, there is no "forgot password"
                email. To reset your PIN, open your terminal and run:
              </p>
              <code className="block bg-background border border-border/50 p-2.5 rounded-xl font-mono text-primary/80 select-all overflow-x-auto whitespace-nowrap">
                sqlite3 ~/.config/sanctuary/sanctuary.db 'UPDATE
                user_preferences SET privacy_pin = NULL;'
              </code>
            </div>
          </details>
        </div>
      </Card>
    </div>
  )
}
