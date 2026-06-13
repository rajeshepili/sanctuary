# Offline and Privacy Guarantees

Sanctuary is a "local-only" application. This document outlines the guarantees we provide regarding connectivity and data privacy.

## Guaranteed Offline Support

- **No Internet Required:** Sanctuary works fully without an internet connection. All features, including habit tracking, journaling, and media viewing, are available offline.
- **Local Assets:** All fonts, icons, and landscapes are bundled with the application. No external CDNs are used.

## Network Isolation

- **Local Server:** The application's internal API server binds only to `127.0.0.1` (localhost). It is not reachable from other devices on your local network.
- **CORS & CSP:** Strict Content Security Policies and CORS rules prevent the application from making unauthorized external requests or being embedded in malicious sites.

## Telemetry and Tracking

- **Zero Analytics:** We do not collect any usage data, crash reports, or telemetry. We have no way of knowing how often you use the app or what features you prefer.
- **No Third-Party Scripts:** There are no tracking pixels, Google Analytics, or social media SDKs included in the codebase.

## Auto-Update Behavior

The only feature that requires internet access is the **Auto-Update** mechanism.
- It only connects to `github.com` to check for the latest release metadata.
- It does not transmit any personal data during this check.
- It can be completely disabled in the **Preferences** section if you prefer manual updates.
