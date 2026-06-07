# Sanctuary

[![CI](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml/badge.svg)](https://github.com/rajeshepili/sanctuary/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sanctuary is a local, private, single-user journal, habit tracking, and reflection app.

Everything runs on your machine, stores data locally in SQLite, and is designed for a single user. There is no cloud sync, no login, and no remote backend. See [docs/OFFLINE.md](docs/OFFLINE.md) for network and privacy guarantees.

## Key features

- Daily journal entries with rich text and media attachments
- Habit tracking and completion history
- Local, private data storage using SQLite
- Desktop experience powered by Electron
- Auto-save, drafts, and soft-delete trash support
- Configurable preferences and local PIN protection

## Requirements

- Node.js 20+ (Node 24 is supported)
- pnpm
- Linux, macOS, or Windows for desktop builds

## Quick start

```bash
pnpm install
pnpm dev
```

Then open `http://127.0.0.1:3000` in your browser.

## Desktop development

Use the desktop development command to run the Vite app and Electron shell together.

```bash
pnpm desktop:dev
```

This starts the app in development mode and opens the Electron window.

## Production build

Build the web assets and package the desktop app:

```bash
pnpm desktop:build
```

The packaged desktop output is written to `dist-electron`.

### Packaged targets

| Platform | Format        | Command                                 |
| -------- | ------------- | --------------------------------------- |
| macOS    | `.dmg`        | `pnpm exec electron-builder --mac dmg`  |
| Windows  | `.exe` (NSIS) | `pnpm exec electron-builder --win nsis` |
| Linux    | `.AppImage`   | `pnpm desktop:build:appimage`           |
| Linux    | `.deb`        | `pnpm desktop:build:deb`                |

`pnpm desktop:build` builds all targets for your current OS (on Linux: AppImage and deb).

### Linux build prerequisites

To produce a `.deb` on Debian/Ubuntu, install `binutils` (provides `ar` for fpm):

```bash
sudo apt-get update && sudo apt-get install -y binutils
```

AppImage builds do not require extra system packages.

## Local data storage

Sanctuary stores all application data locally:

- Journal entries, habits, prompts, and preferences are persisted in SQLite
- Attached media files are stored on the local file system
- There is no cloud sync or external backend

In development, the default database path is `file:dev.db`.

In desktop mode, the app stores data in local OS-friendly app storage.

> Back up your journal and media files regularly if the content is important.

## Reset PIN recovery

If you forget the local PIN, you can reset it using the SQLite database directly.

```bash
sqlite3 ~/.config/sanctuary/sanctuary.db "UPDATE user_preferences SET privacy_pin = NULL WHERE id = 1;"
```

## Testing

Run the full test suite:

```bash
pnpm test
```

Run individual categories:

```bash
pnpm test:unit
pnpm test:integration
pnpm test:watch
```

## Linting and formatting

```bash
pnpm lint
pnpm format
pnpm check
```

## Documentation

| Document                                     | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Development setup, PR checklist, code conventions                               |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, folder layout, feature modules                                           |
| [docs/PRIVACY.md](docs/PRIVACY.md)           | Local-only data handling                                                        |
| [CHANGELOG.md](CHANGELOG.md)                 | Version history                                                                 |
| [SECURITY.md](SECURITY.md)                   | Reporting vulnerabilities                                                       |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)     | Community standards                                                             |
| [MOTIVATION.md](MOTIVATION.md)               | Why I built this app: habits, journaling, and learning open source development. |

## Contributing

We welcome bug reports, documentation improvements, and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the PR checklist, and conventions.

Before opening a PR, run:

```bash
pnpm check && pnpm lint && pnpm typecheck && pnpm build && pnpm test:ci
```

CI runs the same checks on every pull request to `main` (formatting, ESLint, TypeScript, build, and unit + integration tests).

```bash
pnpm test:integration
```

## Releases

### Download pre-built desktop apps

Official builds are published on [GitHub Releases](https://github.com/rajeshepili/sanctuary/releases) when a version tag is pushed.

| Platform | Artifact                |
| -------- | ----------------------- |
| macOS    | `.dmg`                  |
| Windows  | `.exe` (NSIS installer) |
| Linux    | `.AppImage`, `.deb`     |

### Maintainer release checklist

1. Update `version` in `package.json` to match the tag (e.g. `1.0.1`).
2. Ensure `main` passes CI (formatting, lint, build, and unit tests).
3. Commit and push, then create and push an annotated tag:
   ```bash
   git tag -a v1.0.1 -m "v1.0.1"
   git push origin v1.0.1
   ```
4. The [release workflow](.github/workflows/release.yml) builds on macOS, Windows, and Linux and attaches installers to the GitHub Release.
5. Verify each platform artifact on the release page and smoke-test install on at least one machine.

To trigger a release build manually, use **Actions → Build and Release Desktop Apps → Run workflow** (still requires a matching `v*` tag context for publishing).

### Build desktop installers locally

From a clean clone with Node 22 and pnpm installed:

```bash
pnpm install
pnpm build
pnpm desktop:build
```

Output is written to `dist-electron/`. Native modules (`@libsql/client`, `sharp`) are compiled for your current OS — build on each target platform for best results, or rely on CI matrix builds for all three.

## Project structure

```
src/
  routes/               TanStack Router pages (thin wiring)
  features/             Domain modules + co-located components/
  components/           Shared layout, ui, errors
  database/             SQLite schema and initialization
  test/                 Shared test fixtures and DB helpers
server/                 Nitro middleware and API routes
scripts/                Test runner, feature scaffold, bundle check
drizzle/                Generated SQL migrations
docs/                   Architecture, privacy, refactor report
```

See [docs/STRUCTURE.md](docs/STRUCTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Notes for local consumer use

- Sanctuary is intended for one user on a local machine.
- All journal data stays on your device.
- There is no cloud backup or sync by default.
- Keep regular backups of your local database and media files.

## Troubleshooting

### Electron binary issues

If Electron reports a missing binary, reinstall dependencies:

```bash
rm -rf node_modules/.pnpm/electron@34.5.8/node_modules/electron/dist
pnpm install
```

### Build issues

If `pnpm desktop:build` fails, reinstall dependencies and rebuild native modules:

```bash
pnpm install
pnpm desktop:build
```

If the `.deb` step fails with `Need executable 'ar'`, install `binutils` (see [Linux build prerequisites](#linux-build-prerequisites)) or use `pnpm desktop:build:appimage` instead.

## License

Sanctuary is [MIT licensed](LICENSE).

---

Sanctuary is designed for private, local journaling. Use it on your own device and keep your content safe with backups.
