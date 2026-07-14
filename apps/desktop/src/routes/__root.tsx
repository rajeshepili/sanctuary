import {
  HeadContent,
  Scripts,
  Outlet,
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
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <TooltipProvider>
      <ErrorBoundary
        onError={(error, info) => {
          console.error('Global error boundary caught:', error, info)
        }}
      >
        <div className="relative z-10">
          {import.meta.env.VITE_DEMO_MODE && (
            <div className="sticky top-0 z-50 w-full bg-orange-500/90 px-4 py-2 text-center text-sm font-medium text-white shadow-sm backdrop-blur-sm">
              ⚠️ <strong>Demo Mode Active:</strong> This is a public demo.
              Persistent storage, backups, file uploads, and native
              desktop features are disabled. All data will reset upon
              refresh.
            </div>
          )}
          <Outlet />
        </div>
      </ErrorBoundary>
      
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
      <Toaster />
    </TooltipProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere relative min-h-dvh">
        <QueryClientProvider client={queryClient}>
          {children}
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}
