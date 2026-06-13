import { AlertCircle, Terminal } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { parseError } from '#/lib/error-parser'
import { cn } from '#/lib/utils'

interface ErrorSectionProps {
  title?: string
  message?: string
  error?: unknown
  onRetry?: () => void
  showDetails?: boolean
  className?: string
  compact?: boolean
}

export function ErrorSection({
  title,
  message,
  error,
  onRetry,
  showDetails = false,
  className,
  compact = false,
}: ErrorSectionProps) {
  const parsed = error ? parseError(error) : null
  
  const displayTitle = title || parsed?.title || 'Something went wrong'
  const displayMessage = message || parsed?.message || 'An unexpected error occurred.'
  const displayCode = parsed?.code

  return (
    <div className={cn(
      "rounded-2xl border border-destructive/20 bg-destructive/5 overflow-hidden",
      compact ? "p-4" : "p-6",
      className
    )}>
      <div className="flex gap-4">
        <div className={cn(
          "rounded-full bg-destructive/10 flex items-center justify-center shrink-0",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}>
          <AlertCircle className={cn("text-destructive", compact ? "h-4 w-4" : "h-5 w-5")} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={cn("font-bold text-foreground", compact ? "text-sm" : "text-base")}>
              {displayTitle}
            </h3>
            {displayCode && (
              <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-bold tracking-wider uppercase">
                {displayCode}
              </span>
            )}
          </div>
          
          <p className={cn("text-muted-foreground leading-relaxed", compact ? "text-xs" : "text-sm")}>
            {displayMessage}
          </p>

          {showDetails && error instanceof Error && error.stack && (
            <div className="mt-4 rounded-lg bg-background/50 border border-border/50 p-3">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground/50">
                <Terminal className="h-3 w-3" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest">Stack Trace</span>
              </div>
              <pre className="max-h-[150px] overflow-auto text-[10px] font-mono text-muted-foreground/80 whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            </div>
          )}

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className={cn("hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors", compact ? "mt-2 h-7 px-3 text-[11px]" : "mt-4")}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
