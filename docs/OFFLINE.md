# Offline use and network behavior

Sanctuary is meant to work without an internet connection.

## What works offline

- Journaling, identities, settings, trash, exports, and local backups
- JSON and encrypted backup restore for entries, identities, and safe preferences (image binaries remain local files)
- Fonts, icons, and landscape scenes — all bundled with the app, no CDN

## How the network is used

- The built-in API server listens on `127.0.0.1` only. Other devices on your Wi‑Fi cannot reach it.
- Content Security Policy and CORS rules limit what the UI can request.

## Telemetry

There is no usage analytics, crash reporting, or telemetry in the app. I have no visibility into how often you open it or which features you use.

## The one optional online feature

**Auto-update** (desktop only) checks GitHub for new release files. It does not send personal data. You can turn it off in Settings if you prefer to update manually.
