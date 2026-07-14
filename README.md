# Sanctuary

[![CI](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml/badge.svg)](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sanctuary is a local, private, single-user journal, identity tracking, and reflection app.

Everything runs on your device, stores data locally in SQLite, and is designed for a single user. There is no cloud sync, no login, and no remote backend. Have a look at [docs/OFFLINE.md](docs/OFFLINE.md) for network and privacy guarantees.

## Key features

- Daily journal entries with rich text and media attachments
- Identity tracking and progress monitoring
- Local, private data storage using SQLite + Drizzle ORM
- Desktop experience powered by Electron + Nitro + Tanstack Ecosystem + shadcn/ui + Tailwind CSS + React
- Auto-save, drafts, and soft-delete trash support
- Configurable preferences and local PIN protection

## Requirements

- Node.js 22+
- pnpm
- Linux, macOS, or Windows for desktop builds

## Quick start
Have a look at [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more information on how the application is structured.

```bash
git clone https://github.com/rajeshepili/Sanctuary
cd Sanctuary
pnpm install

# Start Electron + Vite dev server
pnpm dev:desktop

# Start renderer (Vite) only
pnpm dev:renderer

# Start Astro landing page dev server
pnpm dev:website
```

## Development Scripts

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `pnpm dev:desktop`  | Start Electron + Vite dev server    |
| `pnpm dev:renderer` | Start renderer (Vite) only          |
| `pnpm dev:website`  | Start Astro landing page dev server |
| `pnpm check`        | Run workspace formatting check      |
| `pnpm test`         | Run full test suite                 |
| `pnpm lint`         | Run ESLint                          |
| `pnpm format`       | Format code with Prettier           |
| `pnpm typecheck`    | Run TypeScript compiler check       |

### Desktop Builds

Build packaged executables using `electron-builder`:

```bash
# Generic build for current OS
pnpm desktop:build

# Specific Linux targets
pnpm desktop:build:appimage
pnpm desktop:build:deb
```

Outputs are generated in `apps/desktop/dist-electron/`.
Database migrations run automatically on startup.

## Project Structure

Sanctuary uses a monorepo structure managed by `pnpm`:

- `apps/desktop/`: The core Electron application.
  - `src/features/`: Domain-driven modules (journal, identities with `habit*` storage compatibility, etc.)
  - `src/database/`: SQLite schema and migrations
  - `main.ts`: Electron entry point
- `apps/website/`: Astro-based landing page.
- `docs/`: Technical documentation and guides.

## Local Data Storage

Sanctuary stores all application data locally:

- **Database:** `sanctuary.db` in your OS's application data folder.
- **Media:** `media/` folder co-located with the database (images are referenced in backups by path/metadata only, binaries are not embedded).
- **No Cloud Sync:** Your data never leaves your device.

## Documentation

> **Terminology Note (Identity vs. Habit)**
> User-facing copy uses **Identity**. Storage and legacy internals still use `habit*` names for database compatibility. New public APIs and docs prefer identity naming, while keeping habit aliases during migration.

| Document                                | Description                          |
| --------------------------------------- | ------------------------------------ |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical stack and design patterns  |
| [PRIVACY.md](docs/PRIVACY.md)           | Data handling and privacy guarantees |
| [OFFLINE.md](docs/OFFLINE.md)           | Offline-first and network isolation  |
| [STRUCTURE.md](docs/STRUCTURE.md)       | In-depth folder and feature layout   |
| [USER_GUIDE.md](docs/USER_GUIDE.md)     | Backups, PIN, exports, everyday use  |
| [MOTIVATION.md](MOTIVATION.md)          | Why this project exists              |
| [CONTRIBUTING.md](CONTRIBUTING.md)      | Development setup and conventions    |


## License

Sanctuary is [MIT licensed](LICENSE).
