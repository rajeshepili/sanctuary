# Architecture

Sanctuary is built as a local-first desktop application using a modern, decoupled architecture.

## Tech Stack

- **Framework:** Electron (Desktop Shell)
- **Local Server:** Nitro (API and Static Assets)
- **Frontend:** React 19 + TanStack (Router, Query, Start)
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Database:** SQLite (via LibSQL) + Drizzle ORM
- **Rich Text:** Tiptap (ProseMirror)

## High-Level Design

The application consists of three main layers that communicate over a local network interface:

### 1. Electron Main Process
The entry point of the application. It manages:
- Application lifecycle and window management.
- Native integration (IPC handlers, auto-updates).
- Spawning and managing the lifecycle of the internal Nitro server.
- Security policies (CSP, sandbox settings).

### 2. Internal Nitro Server
A lightweight server process forked by Electron. It serves as the application's "backend":
- **API Routes:** Handles all data operations (CRUD for journal, habits, etc.).
- **Database Management:** Handles migrations and connection pooling to the local SQLite file.
- **Media Storage:** Manages the local file system for image and video attachments.
- **Security:** Requires a randomly generated session token for all requests, ensuring only the local Electron window can communicate with it.

### 3. Frontend (React)
The user interface, running inside Electron's `BrowserWindow`:
- Uses **TanStack Router** for type-safe routing.
- Uses **TanStack Query** for data fetching and caching from the internal API.
- Leverages **Zustand** for lightweight client-side state management.
- Interfaces with the local server via standard fetch calls (secured by the session token).

## Security Model

- **Session Isolation:** A unique session token is generated on every startup. This token is injected into Electron's requests via `onBeforeSendHeaders` and verified by Nitro's middleware.
- **Sandboxing:** Electron windows run with `sandbox: true` and `contextIsolation: true`.
- **Local-Only:** The server binds to `127.0.0.1`, making it inaccessible from the external network.
- **PIN Protection:** User preferences can include a PIN, which is verified before granting access to sensitive data.

## Data Persistence

- **Database:** Stored in the user's application data directory (`app.getPath('userData')/sanctuary.db`).
- **Media:** Stored in a subfolder (`app.getPath('userData')/media`).
- **Migrations:** Managed by Drizzle Kit and executed by the server on startup.
