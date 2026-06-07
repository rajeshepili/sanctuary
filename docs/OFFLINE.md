# Offline & Network Behavior

Sanctuary is designed as a **soft-offline** application: your journal, habits, media, and preferences are processed and stored entirely on your device. Network access is limited and never used to transmit your personal content unless you explicitly opt in to a feature that requires it.

## Default behavior (no opt-in)

When you use Sanctuary without enabling optional network features:

| Guarantee | Details |
| --------- | ------- |
| **No cloud sync** | Journal entries, habits, prompts, and media are not uploaded anywhere. |
| **No analytics** | No third-party analytics or telemetry SDKs. |
| **Local processing** | All reads/writes go through the embedded local server to SQLite and on-disk media storage. |
| **Loopback only** | The UI communicates with the local server at `127.0.0.1` (desktop) or your dev server (web development). |
| **No automatic geolocation** | Scene timing uses your local clock/timezone unless you explicitly enable location in Settings. |
| **No automatic update checks** | The desktop app does not contact GitHub for updates unless you enable it. |

Your journal content is **never** sent over the internet by default.

## Explicit opt-in features

These features may use the network. Each is **off by default** (or requires a deliberate user action).

| Feature | When it runs | What leaves your device |
| ------- | ------------ | ----------------------- |
| **Automatic update checks** (desktop) | On startup, only if enabled in Settings → Updates | App version metadata to GitHub Releases (via `electron-updater`). No journal data. |
| **Check for updates now** (desktop) | When you click the button in Settings | Same as above — version metadata only. |
| **Location-aware scenes** | When you click “Enable Location-Aware Scenes” in Settings | Coordinates are read from your **OS geolocation API** and saved **locally** in SQLite. Sanctuary does not send coordinates to any reverse-geocoding or third-party location service. |

## Desktop local server hardening

In packaged desktop builds:

- The embedded server binds to **`127.0.0.1`** only (not all network interfaces).
- A per-session **authorization token** is generated at startup. The Electron shell injects this token into loopback requests; other processes on your machine cannot call the API without it.
- The renderer runs with **sandbox**, **context isolation**, and **no Node integration**.

## Web development (`pnpm dev`)

Running the dev server binds to `127.0.0.1:3000`. This is for local development only and is not intended as a public deployment. Session token enforcement is disabled when `SANCTUARY_SESSION_TOKEN` is unset (development mode).

## What is stored locally

- SQLite database (`sanctuary.db` in desktop app data, or `dev.db` in development)
- Media attachments on disk
- Optional PIN hash in SQLite (app lock — not encryption at rest)
- Optional latitude/longitude for scene timing (if you opt in)
- Draft content in browser `localStorage` (unsaved editor state)
- Automated JSON backups in `~/Documents/Sanctuary_Backups/` (desktop, when jobs run)

## Future: cloud sync

Cloud sync is not implemented today. If added later, it will be **opt-in**, documented separately, and will not run without explicit user consent.

## Related documents

- [PRIVACY.md](./PRIVACY.md) — data handling summary
- [SECURITY.md](../SECURITY.md) — reporting security issues
