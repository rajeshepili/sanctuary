# Sanctuary

[![CI](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml/badge.svg)](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sanctuary is a local, private, single-user journal, habit tracking, and reflection app.

Everything runs on your machine, stores data locally in SQLite, and is designed for a single user. There is no cloud sync, no login, and no remote backend. See [docs/OFFLINE.md](docs/OFFLINE.md) for network and privacy guarantees.

## Key features

- Daily journal entries with rich text and media attachments
- Habit tracking with streaks and metrics
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

| Command | Description |
| ------- | ----------- |
| `pnpm dev:desktop` | Start Electron + Vite dev server |
| `pnpm dev:website` | Start Astro landing page dev server |
| `pnpm test` | Run full test suite |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript compiler check |

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

| Document | Description |
| -------- | ----------- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical stack and design patterns |
| [PRIVACY.md](docs/PRIVACY.md) | Data handling and privacy guarantees |
| [OFFLINE.md](docs/OFFLINE.md) | Offline-first and network isolation |
| [STRUCTURE.md](docs/STRUCTURE.md) | In-depth folder and feature layout |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development setup and conventions |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

## License

Sanctuary is [MIT licensed](LICENSE).
