# Privacy

Sanctuary is built for **one person on one machine**. This document describes how data is handled.

For detailed network and offline guarantees, see [OFFLINE.md](./OFFLINE.md).

## Summary

| Topic         | Sanctuary behavior                                           |
| ------------- | ------------------------------------------------------------ |
| Accounts      | None — no sign-up or login server                            |
| Cloud sync    | None (not implemented; would be opt-in if added later)       |
| Analytics     | No third-party analytics in the app                          |
| Data location | SQLite database and media files on your device               |
| Network       | **Off by default.** Loopback only for the local app server. Optional update checks and OS geolocation when you opt in. |

## What is stored locally

- Journal entries, habits, prompts usage, and preferences
- Optional media attachments (images) on disk
- Optional 4-digit PIN hash in the local database (not sent anywhere)
- Optional coordinates for scene timing (if you enable location in Settings — stored locally only)

## What is never transmitted automatically

- Journal text, tags, or habits
- Media files or thumbnails
- Your PIN or preferences (except version metadata when you opt in to update checks)

## Optional network use (opt-in)

| Feature | Data sent |
| ------- | --------- |
| Automatic update checks (desktop) | App version metadata to GitHub Releases — no journal content |
| Manual “Check for updates” (desktop) | Same as above |
| Location-aware scenes | **None over the network.** Uses your OS location API; coordinates saved locally only |

## Desktop vs browser development

- **Development (`pnpm dev`)**: database defaults to `dev.db` in the project directory unless configured otherwise. Dev server listens on `127.0.0.1` only.
- **Desktop (Electron)**: data is stored in OS-specific application data paths (e.g. `~/.config/sanctuary/` on Linux). The local server binds to `127.0.0.1` with session token protection.

## Your responsibilities

- Back up your database and media folders if entries are important.
- Anyone with access to your user account on the device can read local files unless you use full-disk encryption and a strong OS password.
- Export folders and automated backups contain plain copies you create or that the app writes locally.

## Open source

Source code is public; running Sanctuary does not transmit your journal content to the project maintainers.

For security issues, see [SECURITY.md](../SECURITY.md).
