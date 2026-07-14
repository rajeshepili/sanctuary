# Contributing to Sanctuary

Thanks for helping improve Sanctuary — a local-first journal and identity tracker. One user, one machine: no accounts, no cloud by default, data in SQLite on the device.

## Before you start

- Read the [README](README.md) for setup.
- Search [existing issues](https://github.com/rajeshepili/sanctuary/issues) before opening a duplicate.
- Keep PRs small and focused.

## Development setup

**Requirements:** Node.js 22+, [pnpm](https://pnpm.io/), and build tools for native modules (`sharp`, `@libsql/client`).

```bash
git clone https://github.com/rajeshepili/sanctuary.git
cd sanctuary
pnpm install
pnpm dev:desktop
```

Other commands:

- Renderer only: `pnpm dev:renderer` (alias: `pnpm dev:web`)
- Landing site: `pnpm dev:website`

### Desktop release build

```bash
pnpm build:desktop
```

Output: `apps/desktop/dist-electron/`

## Checks before a PR

Same as [CI](.github/workflows/ci.yml):

```bash
pnpm check
pnpm lint
pnpm typecheck
pnpm build
pnpm build:check-size
pnpm test:ci
```

### Tests

```bash
pnpm test
pnpm test:unit
pnpm test:integration
```

## Pull request guidelines

1. Branch from `main` with a clear name (e.g. `fix/backup-timezone`).
2. Say what changed and why; link issues when relevant.
3. Add screenshots for UI changes.
4. Update docs if setup or behavior changes.
5. Do not commit secrets, `dev.db`, or personal exports.

## Project layout

```
sanctuary/
├── apps/
│   ├── desktop/            # Electron app
│   │   ├── src/features/   # Domain modules
│   │   ├── src/database/   # Schema and migrations
│   │   ├── drizzle/        # Generated SQL migrations
│   │   ├── server/         # Nitro routes and tasks
│   │   └── main.ts
│   └── website/            # Astro landing page
└── docs/                   # User and developer docs
```

## Feature module pattern

Under `apps/desktop/src/features/<name>/`:

| File              | Purpose                    |
| ----------------- | -------------------------- |
| `*.schema.ts`     | Zod validation             |
| `*.repository.ts` | DB access and domain logic |
| `*.api.ts`        | Server functions           |
| `*.mutations.ts`  | React Query mutations      |
| `*.options.ts`    | Query options              |
| `*.cache.ts`      | Cache updates              |
| `*.keys.ts`       | Query keys                 |
| `components/`     | Feature UI                 |

Shared layout: `src/components/layout/`. Primitives: `src/components/ui/`.

Scaffold a feature:

```bash
cd apps/desktop
pnpm feature:create reminders
pnpm feature:create daily-notes --route /daily-notes
```

## Background jobs

Backups and cleanup use Nitro tasks — see `server/tasks/jobs.ts` and `nitro.config.ts`. Do not use `setInterval` in the renderer or Electron main process.

## Naming

> **Terminology Note (Identity vs. Habit)**
> Product copy should use **Identity**. Existing storage and older modules can still use `habit*` naming for backward compatibility. Prefer identity naming in new public APIs and docs; keep aliases when touching legacy code.

| Kind               | Convention              | Example                     |
| ------------------ | ----------------------- | --------------------------- |
| Product (UI, docs) | Sanctuary               | Window title, README        |
| npm package        | `sanctuary`             | `apps/desktop/package.json` |
| Journal code       | `journal*` / `Journal*` | `journal.repository.ts`     |
| Settings UI        | `Sanctuary*`            | `SanctuarySettings.tsx`     |
| DB tables          | `snake_case`            | `journal_entries`           |

User-facing strings: `src/config/branding.ts`.

## Database changes

```bash
pnpm db:generate
pnpm db:migrate
```

Note any manual steps for existing installs in the PR description.

## Reporting bugs

Include OS, Node version, desktop vs `pnpm dev:renderer`, steps to reproduce, expected vs actual behavior, and logs (no journal content unless you are okay sharing it).

## Code of conduct

[Contributor Covenant](CODE_OF_CONDUCT.md).

## License

Contributions are MIT licensed, same as the project.
