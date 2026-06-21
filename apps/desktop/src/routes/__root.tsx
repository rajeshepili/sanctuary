import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Toaster } from '#/components/ui/sonner'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '#/components/errors/ErrorBoundary'
import { NotFoundPage } from '#/components/errors/NotFoundPage'
import { TooltipProvider } from '#/components/ui/tooltip'

import appCss from '../styles.css?url'
import { APP_META_DESCRIPTION, APP_NAME } from '#/config/branding'

// Dev-only imports
const DevTools = import.meta.env.DEV
  ? lazy(() =>
      import('#/components/dev/DevTools').then((m) => ({
        default: m.DevTools,
      })),
    )
  : () => null

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: APP_NAME,
      },
      {
        name: 'description',
        content: APP_META_DESCRIPTION,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '192x192',
        href: '/logo192.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere transition-colors duration-1000 relative min-h-dvh">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ErrorBoundary
              onError={(error, info) => {
                console.error('Global error boundary caught:', error, info)
              }}
            >
              <div className="relative z-10">{children}</div>
            </ErrorBoundary>
          </TooltipProvider>

          {import.meta.env.DEV && (
            <Suspense fallback={null}>
              <DevTools />
            </Suspense>
          )}

          <Scripts />
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  )
}
