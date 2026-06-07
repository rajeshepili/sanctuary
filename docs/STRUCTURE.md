# Project structure

Sanctuary uses **feature-sliced** modules: domain logic and UI live together under `src/features/`, while shared chrome stays in `src/components/`.

## Top-level layout

```text
src/
  features/           Domain modules (logic + co-located UI)
  components/         Shared only: layout, ui, errors, dev
  routes/             TanStack Router pages (thin wiring)
  hooks/              Cross-feature React hooks
  lib/                Cross-cutting utilities
  database/           Schema, migrations runner, jobs
  config/             Branding and constants
  contexts/           App-wide React context
  test/               Test DB helpers and fixtures
server/               Nitro routes and middleware
scripts/              Tooling (tests, feature scaffold, bundle check)
drizzle/              SQL migrations
docs/                 Architecture, privacy, reports
```

## Feature module (`src/features/<name>/`)

| Path                         | Responsibility                     |
| ---------------------------- | ---------------------------------- |
| `<name>.schema.ts`           | Zod input/output validation        |
| `<name>.service.ts`          | Business logic and database access |
| `<name>.api.ts`              | `createServerFn` exports           |
| `<name>.options.ts`          | TanStack Query options             |
| `<name>.queries.ts`          | Query hooks                        |
| `<name>.mutations.ts`        | Mutation hooks                     |
| `<name>.cache.ts`            | Manual cache updates               |
| `<name>.keys.ts`             | Query key factories                |
| `<name>.service.test.ts`     | Service-layer accuracy tests       |
| `<name>.integration.test.ts` | Schema/DB integration tests        |
| `components/`                | Feature-specific React UI          |

Scaffold: `pnpm feature:create <kebab-name>`

### Current features

| Feature       | `components/`                   | Notes                                     |
| ------------- | ------------------------------- | ----------------------------------------- |
| `journal`     | Editor, media grid, entry panes | Reference module                          |
| `habits`      | Habit cards, metrics, list      |                                           |
| `media`       | (API only today)                | URLs + file streaming                     |
| `prompts`     | —                               | Logic only                                |
| `preferences` | —                               | Settings UI in `layout/SanctuarySettings` |
| `dashboard`   | Home widgets                    | Composed on `/`                           |

## Shared components (`src/components/`)

| Folder    | Purpose                                         |
| --------- | ----------------------------------------------- |
| `layout/` | App shell, navbar, scenes, settings, onboarding |
| `ui/`     | shadcn design system primitives                 |
| `errors/` | Error boundary, not-found                       |
| `dev/`    | Dev-only tools (stripped from production)       |

**Do not** add new domain folders under `src/components/`. Put domain UI in `src/features/<name>/components/`.

## Routes (`src/routes/`)

Routes should stay **thin**: loaders, meta, and composition. Heavy UI belongs in `features/*/components/` or `features/*/pages/` when a route is large.

## Naming conventions

| Kind              | Convention                 | Example                 |
| ----------------- | -------------------------- | ----------------------- |
| Feature folders   | `kebab-case`               | `journal`, `habits`     |
| Service/API files | `<feature>.<role>.ts`      | `journal.service.ts`    |
| React components  | `PascalCase.tsx`           | `JournalEditor.tsx`     |
| Hooks             | `use-kebab-case.ts`        | `use-journal-editor.ts` |
| Utils             | `kebab-case.ts`            | `format-coordinates.ts` |
| Tests             | `<module>.service.test.ts` | Accuracy / behavior     |
| DB tables         | `snake_case`               | `journal_entries`       |

## Server (`server/`)

| Path                                | Purpose                               |
| ----------------------------------- | ------------------------------------- |
| `middleware/session-auth.ts`        | Loopback session token (desktop prod) |
| `routes/api/media/[mediaId].get.ts` | Stream media files (no base64)        |

Configured via `nitro.config.ts` at repo root.
