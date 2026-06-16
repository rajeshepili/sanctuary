# Changelog

All notable changes to **Sanctuary** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Route-level code splitting for all application routes to improve initial load performance.
- New `HabitCreateForm` and `HabitDetailView` components to improve codebase maintainability.
- Secure PIN verification using salted SHA-256 hashing.

### Changed
- Refactored `habits.tsx` route to use decomposed components.
- Upgraded `hashPin` utility to support random salts and secure verification.

### Removed
- Removed 29 unused UI components from `components/ui` to reduce bundle size and codebase bloat.
- Removed dead `isExpandedPage` logic and residue from the deleted `/write` route.

## [1.0.0] - 2026-05-30

### Added

- Local journal with rich text, media attachments, drafts, and trash
- Habit tracking with history and metrics
- Writing prompts and daily intention
- Preferences, themes, and optional 4-digit PIN lock
- SQLite storage with Drizzle migrations
- Web dev server and Electron desktop builds (AppImage, deb, dmg, NSIS)
- CI (lint, typecheck, build, unit + integration tests) and release workflow
- Public documentation: README, CONTRIBUTING, privacy and architecture guides

[Unreleased]: https://github.com/rajeshepili/sanctuary/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rajeshepili/sanctuary/releases/tag/v1.0.0
