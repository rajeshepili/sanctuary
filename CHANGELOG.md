# Changelog

All notable changes to **Sanctuary** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- User guide (`docs/USER_GUIDE.md`) and restored privacy/architecture docs.
- `PassphraseModal` for encrypted exports (replaces browser `prompt()`).
- CI `build:check-size` at workspace root; fixed release workflow for the pnpm monorepo.
- Husky pre-commit hook (typecheck + lint-staged).
- **Quick start** vs **full setup** onboarding paths (both require the local-data disclaimer).
- **Layout mode**: compact header or full-screen scene (`layout_mode` preference).
- **Encrypted exports** tab — passphrase-protected `.enc` files to a folder you choose.
- JSON backup **restore** (merge or replace) from Settings → Data.
- Full backup format v2 (journal entries + identities).

### Changed

- Backup scheduling uses local calendar dates (fixes timezone skip bug).
- Feature layer renamed from `*.service.ts` to `*.repository.ts` where applicable.
- Export logic moved to `features/export/`.
- Website build output moved to `apps/website/dist` so it no longer overwrites `docs/`.
- Contributor docs updated for current folder layout.
- Landing page and guides copy edited for accuracy (PIN hashing, backup paths).
- Settings redesigned: General, Data, Encrypted exports, Identities, App lock — active tab only renders.
- Hero and page header reworked for contrast and less motion; immersive home scrolls into content.
- Router `defaultPreload: false` to reduce lag on navigation.
- PIN lock session persists until app restart or "Lock now".

### Removed

- Unused `@playwright/test` dependency (no e2e suite yet).
- `REPORT.md` from repo root (notes moved to `docs/internal/`).
- Cloud sync branding and `preferences.sync.service.ts`.

### Fixed

- Scheduled backup test: skip when `lastBackupAt` is already today.
- GitHub release workflow: correct `apps/desktop` paths and Node 22.

## [1.0.0] - 2026-05-30

### Added

- Local journal with rich text, media attachments, drafts, and trash
- Identity tracking with history and metrics
- Writing prompts and daily intention
- Preferences, themes, and optional 4-digit PIN lock
- SQLite storage with Drizzle migrations
- Web dev server and Electron desktop builds (AppImage, deb, dmg, NSIS)
- CI (lint, typecheck, build, unit + integration tests) and release workflow
- Public documentation: README, CONTRIBUTING, privacy and architecture guides

[Unreleased]: https://github.com/rajeshepili/sanctuary/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rajeshepili/sanctuary/releases/tag/v1.0.0
