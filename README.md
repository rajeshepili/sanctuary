# Sanctuary

[![CI](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml/badge.svg)](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sanctuary is a local, private, single-user journal, identity tracking, and reflection app.

Everything runs on your machine, stores data locally in SQLite, and is designed for a single user. There is no cloud sync, no login, and no remote backend. See [docs/OFFLINE.md](docs/OFFLINE.md) for network and privacy guarantees.

## Key features

- Daily journal entries with rich text and media attachments
- Identity tracking and progress monitoring
- Local, private data storage using SQLite + Drizzle ORM
- Desktop experience powered by Electron + Nitro
- Auto-save, drafts, and soft-delete trash support
- Configurable preferences and local PIN protection

## Requirements

- Node.js 22+
- pnpm
- Linux, macOS, or Windows for desktop builds

## Quick start

```bash
pnpm install
pnpm dev:desktop
```

This starts the desktop app in development mode.

## Development Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev:desktop` | Start Electron + Vite dev server    |
| `pnpm dev:website` | Start Astro landing page dev server |
| `pnpm test`        | Run full test suite                 |
| `pnpm lint`        | Run ESLint                          |
| `pnpm format`      | Format code with Prettier           |
| `pnpm typecheck`   | Run TypeScript compiler check       |

### Desktop Builds

Build packaged executables using `electron-builder`:

```bash
cd apps/desktop
pnpm install

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
  - `src/features/`: Domain-driven modules (journal, habits, etc.)
  - `src/database/`: SQLite schema and migrations
  - `main.ts`: Electron entry point
- `apps/website/`: Astro-based landing page and documentation.
- `docs/`: Technical documentation and guides.

## Local Data Storage

Sanctuary stores all application data locally:

- **Database:** `sanctuary.db` in your OS's application data folder.
- **Media:** `media/` folder co-located with the database.
- **No Cloud Sync:** Your data never leaves your device.

## Documentation

> **Terminology Note (Identity vs. Habit)**
> You'll notice the app uses "Identity" on the screen, but "Habit" in the code, folders, variables, database tables etc. This is on purpose! I started by building a standard habit tracker with streaks and badges. Later, I switched to James Clear's "identity-focused" approach. I updated all the user-facing text and UI to say "Identity" to match this new mindset, but kept "Habit" in the code to avoid rewriting the whole database and refactoring everything. I have plans to refactor this in the future, but I haven't gotten around to it yet.

| Document                                | Description                          |
| --------------------------------------- | ------------------------------------ |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical stack and design patterns  |
| [PRIVACY.md](docs/PRIVACY.md)           | Data handling and privacy guarantees |
| [OFFLINE.md](docs/OFFLINE.md)           | Offline-first and network isolation  |
| [STRUCTURE.md](docs/STRUCTURE.md)       | In-depth folder and feature layout   |
| [USER_GUIDE.md](docs/USER_GUIDE.md)     | Backups, PIN, exports, everyday use  |
| [MOTIVATION.md](MOTIVATION.md)          | Why this project exists              |
| [CONTRIBUTING.md](CONTRIBUTING.md)      | Development setup and conventions    |
| [CHANGELOG.md](CHANGELOG.md)            | Version history                      |

## License

Sanctuary is [MIT licensed](LICENSE).
