import { AlertTriangle, GitBranchPlus, RefreshCw } from 'lucide-react'
import { APP_REPO_URL } from '#/config/branding'
import { ScrollArea } from '#/components/ui/scroll-area'

export function GlobalErrorFallback({
  error,
  reset,
}: {
  error: Error
  reset?: () => void
}) {
  const handleReport = () => {
    const stackTrace = error.stack || 'No stack trace available'
    // Strip absolute paths up to "Sanctuary" or similar to avoid leaking system paths
    const safeStackTrace = stackTrace.replace(/(\/.*?\/)?src\//g, 'src/')

    const url = new URL(`${APP_REPO_URL}/issues/new`)
    url.searchParams.set('template', 'bug_report.yml')
    url.searchParams.set('title', `[Bug]: ${error.message}`)
    url.searchParams.set(
      'description',
      `The application crashed with the following error:\n\n\`\`\`text\n${safeStackTrace}\n\`\`\``,
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
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            Sanctuary encountered an unexpected error. You can try reloading, or
            report this issue to help us fix it.
          </p>
        </div>

        <ScrollArea className="w-full max-h-[300px] mt-2">
          <div className="w-full text-left p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm">
            <pre className="text-[11px] font-mono text-red-600 font-semibold whitespace-pre-wrap break-all">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </div>
        </ScrollArea>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
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
