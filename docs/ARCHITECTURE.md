# Architecture

Sanctuary is a desktop app with a small local web stack inside it.

## Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| Desktop shell | Electron                                  |
| Local API     | Nitro                                     |
| UI            | React 19, TanStack Router, TanStack Query |
| Styling       | Tailwind CSS 4, Framer Motion             |
| Database      | SQLite (libSQL) + Drizzle ORM             |
| Editor        | Tiptap (ProseMirror)                      |

## Three moving parts

### Electron main process (`main.ts`)

- Opens the window and system tray
- Forks the Nitro server as a child process
- Injects a per-session auth token into requests from the app window
- Handles auto-update and native dialogs (folders, backups)

### Nitro server (`server/`, `nitro.config.ts`)

- Serves the built UI and API routes
- Runs Drizzle migrations on startup
- Stores media files next to the database
- Rejects API calls that do not include the session token

### React UI (`src/`)

- File-based routes under `src/routes/`
- Feature modules under `src/features/` (journal, identities via `habits` storage compatibility, preferences, export, …)
- Talks to the local API over HTTP on localhost

## Security basics

- A random session token is created at startup and checked on each API request.
- Renderer runs with `contextIsolation` and sandboxing enabled.
- Optional 4-digit PIN is a screen lock, not encryption of the database file.

## Where files live (desktop)

- Database: `sanctuary.db` in Electron `userData`
- Media: `media/` beside the database
- Migrations: `apps/desktop/drizzle/`, applied automatically
