# Project Structure

Sanctuary is organized as a monorepo to manage the desktop application and its landing website.

## Root Directory

- `apps/`: Contains the sub-projects.
  - `desktop/`: The main Electron application.
  - `website/`: The Astro-based landing page.
- `docs/`: In-depth documentation.
- `drizzle/`: Shared database migrations.
- `packages/`: (Reserved for shared libraries if needed).

## Desktop Application (`apps/desktop`)

The desktop app follows a feature-based structure for better scalability and maintainability.

### Core Files
- `main.ts`: Electron main process entry.
- `preload.ts`: Bridge between Electron and the UI.
- `nitro.config.ts`: Internal API server configuration.

### Source Code (`src/`)
- `features/`: Domain-driven modules. Each feature contains its own:
  - Components (co-located)
  - Hooks
  - Logic/Types
- `database/`: Drizzle schema, migration logic, and seed data.
- `components/`: Shared UI components (layout, errors, primitive UI).
- `routes/`: TanStack Router file-based routing.
- `lib/` & `utils/`: Shared utilities and constants.
- `stores/`: Global state (Zustand).
- `hooks/`: Global React hooks.

## Key Design Patterns

- **Co-location:** We prefer keeping components close to where they are used (in `features/`) rather than in a flat global components folder.
- **Type-Safety:** Full TypeScript support across the stack, including type-safe routing and database queries.
- **Local-First API:** The UI treats the internal Nitro server as a standard remote API, simplifying the mental model for data flow.
