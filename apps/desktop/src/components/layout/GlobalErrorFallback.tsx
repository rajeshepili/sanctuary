import { AlertTriangle, GitBranchPlus, RefreshCw, Terminal } from 'lucide-react'
import { APP_REPO_URL } from '#/config/branding'
import { ScrollArea } from '#/components/ui/scroll-area'
import { parseError } from '#/lib/error-parser'

export function GlobalErrorFallback({
  error,
  reset,
}: {
  error: Error
  reset?: () => void
}) {
  const parsed = parseError(error)

  const handleReport = () => {
    const stackTrace = error.stack || 'No stack trace available'
    // Strip absolute paths up to "Sanctuary" or similar to avoid leaking system paths
    const safeStackTrace = stackTrace.replace(/(\/.*?\/)?src\//g, 'src/')

    const url = new URL(`${APP_REPO_URL}/issues/new`)
    url.searchParams.set('template', 'bug_report.yml')
    url.searchParams.set('title', `[Bug]: ${error.message} (${parsed.code})`)
    url.searchParams.set(
      'description',
      `The application crashed with the following error:\n\n- Code: \`${parsed.code}\`\n- Message: \`${error.message}\`\n\n\`\`\`text\n${safeStackTrace}\n\`\`\``,
    )

    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }

  const handleReset = () => {
    if (reset) {
      reset()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 z-9999 w-full h-full flex items-center justify-center bg-white text-black p-6">
      <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-6">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold tracking-wider uppercase">
              {parsed.code}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{parsed.title}</h1>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            {parsed.message ||
              'Sanctuary encountered an unexpected error. You can try reloading, or report this issue to help us fix it.'}
          </p>
        </div>

        <ScrollArea className="w-full max-h-[300px] mt-2 text-left">
          <div className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Terminal className="w-3 h-3" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest">
                Diagnostic Info
              </span>
            </div>
            <pre className="text-[11px] font-mono text-gray-600 whitespace-pre-wrap break-all leading-relaxed">
              {error.stack}
            </pre>
          </div>
        </ScrollArea>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={handleReport}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium"
          >
            <GitBranchPlus className="w-4 h-4" />
            Report Issue on GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
