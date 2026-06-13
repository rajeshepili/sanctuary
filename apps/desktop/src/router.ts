import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from '#/routeTree.gen'
import { GlobalErrorFallback } from '#/components/layout/GlobalErrorFallback'

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: GlobalErrorFallback,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
