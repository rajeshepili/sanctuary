# Contributing to Sanctuary

Thank you for helping improve Sanctuary — a local-first journal and habit tracker. This project is designed for a **single user on one machine**: no accounts, no cloud sync, and all data stays in SQLite on the device.

## Before you start

- Read the [README](README.md) for setup and architecture overview.
- Search [existing issues](https://github.com/rajeshepili/sanctuary/issues) before opening a duplicate.
- Keep changes focused. Prefer small, reviewable pull requests.

## Development setup

**Requirements:** Node.js 20+ (22 recommended), [pnpm](https://pnpm.io/), and build tools for native modules (`sharp`, `@libsql/client`).

```bash
git clone https://github.com/rajeshepili/sanctuary.git
cd sanctuary
pnpm install
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). For the Electron shell:

```bash
pnpm desktop:dev
```

### Desktop release build

```bash
pnpm desktop:build
```

## Checks before opening a PR

Run the same commands as [CI](.github/workflows/ci.yml):

```bash
pnpm install
pnpm check      # Prettier formatting
pnpm lint       # ESLint
pnpm typecheck  # TypeScript
pnpm build      # Production web build
pnpm test:ci    # Unit + integration tests
```

### Full test suite (local)

```bash
pnpm test:unit
pnpm test:integration
```

## Pull request guidelines

1. **Branch** from `main` with a descriptive name (e.g. `fix/habit-streak-timezone`).
2. **Describe** what changed and why. Link related issues when applicable.
3. **Include** screenshots or short screen recordings for UI changes.
4. **Update** docs if behavior, setup, or release steps change.
5. **Do not** commit secrets, local databases (`dev.db`), or personal exports.

Maintainers will review for correctness, privacy (local-only data paths), and consistency with existing patterns under `src/features/`.

## Project conventions

### Folder layout

```
sanctuary/
├── apps/
│   ├── desktop/            # Core Electron application
│   │   ├── src/
│   │   │   ├── components/  # Shared UI (layout/, ui/, errors/, dev/)
│   │   │   ├── config/      # App configuration
│   │   │   ├── database/    # Schema, init, migrations runner
│   │   │   ├── features/    # Domain modules + co-located components/
│   │   │   ├── hooks/       # Shared React hooks
│   │   │   ├── lib/         # Cross-cutting utilities
│   │   │   ├── routes/      # TanStack Router pages
│   │   │   ├── stores/      # Global state (Zustand)
│   │   │   └── utils/       # Pure helper functions
│   │   ├── main.ts         # Electron entry point
│   │   └── nitro.config.ts  # API server configuration
│   └── website/            # Landing page (Astro)
├── docs/                   # In-depth documentation
└── drizzle/                # SQL migrations (generated)
```

### Feature module pattern

Each domain under `src/features/<name>/` uses consistent suffixes:

| File                    | Purpose                          |
| ----------------------- | -------------------------------- |
| `*.schema.ts`           | Zod validation                   |
| `*.service.ts`          | Business logic / DB access       |
| `*.api.ts`              | Server functions                 |
| `*.mutations.ts`        | React Query mutations            |
| `*.queries.ts`          | React Query hooks                |
| `*.options.ts`          | Query options                    |
| `*.cache.ts`            | Manual cache updates             |
| `*.keys.ts`             | Query key factories              |
| `*.service.test.ts`     | Service-layer accuracy tests     |
| `*.integration.test.ts` | DB schema integration tests      |
| `components/`           | Feature-specific UI (co-located) |

**Layout rule:** domain logic lives in `src/features/<name>/`. Shared app chrome stays in `src/components/layout/` and the design system in `src/components/ui/`.

### Scaffold a new feature

```bash
pnpm feature:create reminders
pnpm feature:create daily-notes --route /daily-notes
```

This generates the module files, a route stub, and a starter service test. Then add migrations, implement the service, and build UI under `src/features/<name>/components/`.

### Naming

| Kind                   | Convention              | Example                                   |
| ---------------------- | ----------------------- | ----------------------------------------- |
| **Product (UI, docs)** | **Sanctuary**           | Window title, navbar, README              |
| **npm package**        | `sanctuary`             | `package.json` `name`                     |
| **GitHub repo**        | `sanctuary`             | `github.com/rajeshepili/sanctuary`        |
| **Journal domain**     | `journal*` / `Journal*` | `journal.service.ts`, `JournalEditor.tsx` |
| **App settings UI**    | `Sanctuary*`            | `SanctuarySettings.tsx`                   |
| **Database tables**    | `snake_case`            | `journal_entries`                         |

Shared user-facing strings live in [`src/config/branding.ts`](src/config/branding.ts).

- **React components:** PascalCase files (`JournalEditor.tsx`, `SanctuarySettings.tsx`)
- **Hooks / utils / services:** camelCase files (`use-draft.ts`, `journal.service.ts`)
- **Routes:** kebab or index under `src/routes/__app/`

Match existing TypeScript strictness and Zod validation at API boundaries.

## Database changes

If you change the schema:

```bash
pnpm db:generate
pnpm db:migrate
```

Document any manual steps for existing local installs in the PR description.

## Reporting bugs

Include:

- OS and Node version
- Browser or desktop (Electron) vs `pnpm dev`
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (no journal content unless you are comfortable sharing it)

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Please be respectful in issues and pull requests.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
