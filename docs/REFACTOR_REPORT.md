# Sanctuary refactor report

**Date:** June 2026  
**Scope:** Workstreams 1–4, structure standardization, cleanup  
**Status:** In progress toward public release (&lt;300 MB desktop target)

---

## Executive summary

Sanctuary is a **local-first journal and habit tracker** using React 19, TanStack Start/Nitro, SQLite (`@libsql/client`), and an optional Electron shell. A four-workstream refactor improved **trust (offline)**, **formalization**, **test-backed accuracy**, and **bundle performance** without removing animated mood scenes.

The app’s core strength is a **documented feature-module pattern** with real offline defaults. Main remaining gaps: **encryption at rest**, **code signing**, **cloud sync** (future), and **full install-size validation** on all three desktop platforms.

---

## Workstream 1 — Trust & offline

### Completed

| Change                                                  | Impact                                            |
| ------------------------------------------------------- | ------------------------------------------------- |
| Removed BigDataCloud reverse geocoding                  | No third-party location API                       |
| Geolocation opt-in only (settings + saved coords)       | No automatic `navigator.geolocation` in mood hook |
| Auto-updater opt-in via preload + `electron-prefs.json` | No GitHub contact by default                      |
| Session token + `server/middleware/session-auth.ts`     | Desktop prod API hardened on loopback             |
| Electron injects `Authorization` on localhost requests  | Renderer never holds token                        |
| CSP tightened (no Google Fonts CDN)                     | Smaller attack surface                            |
| Dev server binds `127.0.0.1`                            | Not exposed on all interfaces                     |
| Production devtools removed                             | Smaller prod bundle                               |
| Dead dependencies removed (`three`, `recharts`, etc.)   | Smaller `node_modules` / install                  |
| `docs/OFFLINE.md` + updated `PRIVACY.md`                | Soft-offline guarantees documented                |

### Guarantees (soft offline)

- **Default:** No outbound network; journal/habit/media data stays on device.
- **Opt-in:** Update checks (version metadata only), OS geolocation when user enables scenes.
- **Loopback:** UI ↔ embedded server on `127.0.0.1` only in production desktop.

---

## Workstream 2 — Formalization

### Completed

| Change                                                                      | Impact                            |
| --------------------------------------------------------------------------- | --------------------------------- |
| `pnpm feature:create <name>` generator                                      | Consistent new features           |
| Media module completed (`keys`, `options`, `queries`, `mutations`, `cache`) | Decoupled from journal-only API   |
| `IMPLEMENTATION_GUIDE.md` archived to `docs/archive/`                       | Single source of truth in `docs/` |
| `docs/STRUCTURE.md`                                                         | Folder and naming policy          |
| Updated `CONTRIBUTING.md` / `ARCHITECTURE.md`                               | Contributor alignment             |

### Feature module template

```text
src/features/<name>/
  <name>.schema.ts | .service.ts | .api.ts
  <name>.options.ts | .queries.ts | .mutations.ts
  <name>.cache.ts | .keys.ts
  <name>.service.test.ts
  components/
```

---

## Workstream 3 — Accuracy tests

### Completed

Service-layer and pure-function tests (not labeled separately — just **tests**):

| Area           | File                                          | Locks in                        |
| -------------- | --------------------------------------------- | ------------------------------- |
| Streak math    | `src/utils/streak.test.ts`                    | `computeHabitStreak`, schedules |
| Habit sync     | `src/features/habits/habits.service.test.ts`  | DB streak persistence           |
| Trash / purge  | `src/database/purge.test.ts`                  | 30-day grace, orphan media      |
| Media pipeline | `src/features/media/media.service.test.ts`    | WebP output, validation         |
| Export formats | `src/features/journal/journal.export.test.ts` | JSON v1 + Markdown frontmatter  |

**Infrastructure:** `createIsolatedTestDatabase()` runs real Drizzle migrations; `mockGetDb()` wires services to test DB.

**72 tests passing** (unit + integration).

### Not yet covered

- Full `journal.service.ts` create/update/delete flows
- Playwright / e2e (explicitly deferred)
- Perf regression baselines in CI (`database.perf.test.ts` excluded from default unit run)

---

## Workstream 4 — Bundle size & performance

### Completed

| Change                                               | Impact                                         |
| ---------------------------------------------------- | ---------------------------------------------- |
| Lazy-loaded mood scenes (`scene-loaders.ts`)         | Scenes split into async chunks                 |
| Rolldown `advancedChunks` for TipTap + framer-motion | Vendor chunks separated                        |
| Media served at `/api/media/:id`                     | No base64 through server functions in UI       |
| `MediaImage` uses direct URLs + `loading="lazy"`     | Less memory and JS on list views               |
| `scripts/check-bundle-size.js` + CI step             | Budget: 550 KB largest chunk, 1800 KB total JS |
| `build:check-size` npm script                        | Local verification after build                 |

### Observed client bundles (post-WS4, `pnpm build:check-size`)

| Metric           | Before (approx.)    | After                                                  |
| ---------------- | ------------------- | ------------------------------------------------------ |
| Largest chunk    | ~540 KB (`index`)   | **488 KB** (`vendor-tiptap`)                           |
| Main entry chunk | ~540 KB             | **337 KB** (`index`)                                   |
| Total client JS  | ~1,700 KB           | **1,410 KB**                                           |
| Mood scenes      | Eager in main graph | **Lazy** (`Morning`, `Day`, `Evening`, `Night` chunks) |

CI enforces budgets: 550 KB max single chunk, 1800 KB total JS.

### Desktop install size (&lt;300 MB target)

| Factor                            | Notes                        |
| --------------------------------- | ---------------------------- |
| Electron + Chromium               | Largest fixed cost           |
| Embedded Nitro server             | Full Node runtime in package |
| `sharp`, `@libsql` native modules | Unpacked from ASAR           |
| Removed dead deps                 | Modest savings               |

**Recommendation:** Measure `dist-electron/` on CI per platform after `pnpm desktop:build`. Target tracking as a follow-up script (not yet automated).

### Database

Existing indexes on `journal_entries`, `habit_completions`, `entry_media`. No new migration in WS4; hot paths use indexed columns.

---

## Structure standardization

### Before → after

| Before                                     | After                                |
| ------------------------------------------ | ------------------------------------ |
| `src/components/journal/`                  | `src/features/journal/components/`   |
| `src/components/habits/`                   | `src/features/habits/components/`    |
| `src/components/dashboard/`                | `src/features/dashboard/components/` |
| `src/components/layout/`, `ui/`, `errors/` | Unchanged (shared chrome)            |

### Naming cleanup

- Removed unused hooks: `useDebounce`, `useInterval`, `useTimeout`, `use-mobile`
- Standard: hooks use `use-kebab-case.ts`

### Responsibility split (manageable, not over-chunked)

| Layer                   | Owns                               |
| ----------------------- | ---------------------------------- |
| `features/*/service`    | Business rules + DB                |
| `features/*/api`        | Server function boundary           |
| `features/*/components` | Domain UI                          |
| `components/layout`     | App chrome, scenes, settings shell |
| `routes/`               | Routing, loaders, page composition |
| `server/`               | HTTP middleware, media streaming   |

---

## Cleanup

### Dependencies removed

- `three`, `recharts`, `@uiw/react-md-editor`, `cmdk`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`
- `better-sqlite3` (direct dep; runtime uses `@libsql/client`)
- `next-themes`, `@hookform/resolvers`, `react-hook-form`, `shadcn` (unused in app code)

### Code removed

- Unused hook files (see above)
- BigDataCloud fetch in settings
- Automatic geolocation in `use-mood.ts`
- Unconditional TanStack Devtools in production root

---

## Strengths

1. **Local-first by default** — Documented offline contract; opt-in network only.
2. **Feature module pattern** — Repeatable scaffold; journal as reference.
3. **Test-backed critical paths** — Streaks, trash, media, exports guarded before optimization.
4. **Electron hardening** — Sandbox, context isolation, session token, preload for desktop-only APIs.
5. **Dual platform** — Same codebase for `pnpm dev` (web) and Electron desktop.
6. **Animated scenes preserved** — Lazy-loaded; not sacrificed for size.
7. **Clear docs** — `OFFLINE.md`, `STRUCTURE.md`, `ARCHITECTURE.md`.

---

## Weaknesses & technical debt

| Area           | Issue                                                                                 | Severity               |
| -------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| Architecture   | Localhost HTTP instead of IPC; larger attack surface than classic Electron            | Medium                 |
| Tests          | Services for journal CRUD untested; integration tests are schema-level                | Medium                 |
| Test DB        | Legacy `createTestDatabase()` still uses manual schema; isolated tests use migrations | Low                    |
| Media          | `getMedia` server fn still supports base64 (API compat); UI uses URLs                 | Low                    |
| Preferences UI | `SanctuarySettings` still in `layout/` not `features/preferences/components/`         | Low                    |
| Encryption     | PIN is app lock only; data at rest is plaintext                                       | High (roadmap)         |
| Signing        | No code signing in CI yet                                                             | Medium (post-traction) |
| Docs drift     | README Electron version note may lag `package.json`                                   | Low                    |
| `pnpm` 11      | `allowBuilds` in `pnpm-workspace.yaml` required for native modules                    | Low                    |

---

## Security

### Mitigations in place

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`
- CSP on Electron responses (no external font CDNs)
- Per-session `SANCTUARY_SESSION_TOKEN` on desktop production server
- Preload exposes only: auto-update prefs + check
- Single-instance lock

### Residual risks

| Risk                | Detail                                                   | Mitigation path                                 |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| Localhost API       | Any local process could try loopback; token reduces risk | Token rotation, bind strict, optional IPC later |
| PIN storage         | SHA-256 + static salt; not encryption                    | Layer encryption (Workstream 5)                 |
| CSP `unsafe-inline` | Required by TanStack hydration today                     | Nonce/hash CSP when build supports              |
| `electron-updater`  | When opt-in, contacts GitHub                             | Documented; metadata only                       |
| DevTools in dev     | Open automatically in `desktop:dev`                      | Dev-only                                        |
| No rate limiting    | Server functions trust localhost                         | Low priority single-user app                    |

---

## Privacy

See [OFFLINE.md](./OFFLINE.md) and [PRIVACY.md](./PRIVACY.md).

| Topic                       | Status                                        |
| --------------------------- | --------------------------------------------- |
| Cloud sync                  | Not implemented                               |
| Analytics                   | None                                          |
| Automatic data exfiltration | None                                          |
| Location                    | Opt-in; coordinates stored locally only       |
| Backups                     | Local `~/Documents/Sanctuary_Backups/` (JSON) |
| Exports                     | User-initiated download                       |

**User responsibility:** OS account access = data access unless full-disk encryption + future app encryption enabled.

---

## Scaling & future growth

| Dimension           | Current limit          | Notes                                         |
| ------------------- | ---------------------- | --------------------------------------------- |
| Users               | Single user            | By design                                     |
| Entries             | SQLite on one machine  | Fine for years of journaling                  |
| Media               | Disk + 25 MB per image | `sharp` WebP compression                      |
| Concurrent requests | Single embedded server | Adequate for desktop                          |
| Web deployment      | Dev-oriented           | Not hardened for public multi-tenant hosting  |
| Cloud sync          | Not built              | Add as opt-in `features/sync` on server layer |
| Multi-device        | Manual export/import   | Until sync ships                              |

**Scaling recommendation:** Keep sync on the **server/service layer** sharing `*.service.ts` with local DB; do not fork data paths for IPC and HTTP.

---

## Recommended next steps

1. **Encryption at rest** — `safeStorage` + field/file encryption module
2. **Desktop size CI** — Measure `dist-electron/` per platform artifact
3. **Journal service tests** — Create/update/delete/trash flows
4. **Move `SanctuarySettings`** → `features/preferences/components/`
5. **Code signing** — After release traction validation
6. **Cloud sync design** — Opt-in, documented data flow

---

## Related documents

- [STRUCTURE.md](./STRUCTURE.md) — Folder layout and naming
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Stack and data flow
- [OFFLINE.md](./OFFLINE.md) — Network guarantees
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Development workflow
