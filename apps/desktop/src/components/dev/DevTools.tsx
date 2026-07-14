import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { SanctuaryDevPanel } from './SanctuaryDevPanel'

export function DevTools() {
  return (
    <TanStackDevtools
      config={{ position: 'bottom-left' }}
      plugins={[
        {
          name: 'Sanctuary Debug',
          render: <SanctuaryDevPanel />,
        },
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  )
}
