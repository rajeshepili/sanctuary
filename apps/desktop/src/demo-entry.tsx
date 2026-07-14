/**
 * Demo SPA entry point.
 *
 * This replaces the TanStack Start SSR entry (which is driven by Nitro + shellComponent).
 * In demo mode the app runs entirely in the browser with MSW intercepting all API calls.
 *
 * The root route's `shellComponent` (which renders <html><head><body>) is NOT used here —
 * instead we mount directly into <div id="root"> and let TanStack Router drive navigation.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '#/routeTree.gen'
import { GlobalErrorFallback } from '#/components/layout/GlobalErrorFallback'
import '#/styles.css'

async function prepare() {
  const { worker } = await import('#/mocks/browser')
  // On Vercel, the app is served from root so MSW finds its worker at /mockServiceWorker.js
  await worker.start({ onUnhandledRequest: 'bypass' })
}

async function main() {
  await prepare()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 60_000,
    defaultErrorComponent: GlobalErrorFallback,
  })

  const root = document.getElementById('root')!

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

main().catch(console.error)
