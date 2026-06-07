# Architecture

Sanctuary is a **local-first** TanStack Start application with an optional Electron shell.

## Stack

| Layer         | Technology                                             |
| ------------- | ------------------------------------------------------ |
| UI            | React 19, Tailwind CSS, Radix / Base UI                |
| Routing & SSR | TanStack Router, TanStack Start                        |
| Data          | TanStack Query, Drizzle ORM, SQLite (`@libsql/client`) |
| Desktop       | Electron 34, electron-builder                          |
| Tests         | Vitest                                                 |

## High-level flow

```mermaid
flowchart LR
  subgraph client [Browser / Electron window]
    UI[React routes & components]
    RQ[React Query]
  end
  subgraph server [Embedded Node server]
    API[Server functions / API routes]
    SVC[Feature services]
    DB[(SQLite)]
  end
  UI --> RQ --> API --> SVC --> DB
```

In **production desktop** mode, Electron forks `dist/server/server.js` and loads the UI from `http://127.0.0.1:<port>`.

## Directory layout

```
src/
  routes/           # TanStack Router pages (__app/, __root.tsx)
  components/       # UI by domain (journal/, habits/, layout/, ui/)
  features/         # Domain modules (schema, service, api, queries, …)
  database/         # Drizzle schema and initialization
  config/           # Branding and app constants
  test/             # Fixtures and in-memory DB helpers
drizzle/            # Generated SQL migrations
main.js             # Electron main process
electron-builder.yml
```

## Feature module pattern

Each domain under `src/features/<name>/` typically includes:

- `*.schema.ts` — Zod validation
- `*.service.ts` — business logic and database access
- `*.api.ts` — server functions exposed to the client
- `*.queries.ts` / `*.mutations.ts` — React Query integration
- `*.options.ts` / `*.cache.ts` / `*.keys.ts` — query wiring
- `components/` — feature-specific UI (co-located with the module)
- `*.service.test.ts` — service-layer accuracy tests (streaks, exports, purge, media, etc.)
- `*.integration.test.ts` — database schema integration tests

Scaffold new modules with `pnpm feature:create <name>`.

## Naming conventions

| Kind                  | Convention    | Example                               |
| --------------------- | ------------- | ------------------------------------- |
| Product (user-facing) | **Sanctuary** | Window title, navbar                  |
| npm / GitHub repo id  | `sanctuary`   | `github.com/rajeshepili/sanctuary`    |
| Journal domain code   | `journal*`    | `journal.service.ts`, `JournalEditor` |
| Settings UI           | `Sanctuary*`  | `SanctuarySettings.tsx`               |
| Database tables       | `snake_case`  | `journal_entries`                     |

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full contributor guidelines.
