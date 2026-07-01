# Project structure

```
sanctuary/
├── apps/
│   ├── desktop/          # Electron app (main product)
│   │   ├── src/
│   │   │   ├── features/     # journal, habits (identities), preferences, export, …
│   │   │   ├── database/     # schema, migrations runner
│   │   │   ├── components/   # shared UI (layout/, ui/)
│   │   │   ├── routes/       # TanStack Router pages
│   │   │   └── infrastructure/  # media processing, shared I/O
│   │   ├── server/           # Nitro API routes and tasks
│   │   ├── drizzle/          # SQL migrations
│   │   ├── main.ts
│   │   └── preload.ts
│   └── website/            # Astro landing page (Git submodule)
├── docs/                   # Markdown docs (this folder)
└── .github/workflows/      # CI and release
```

## Feature module layout

Each domain under `apps/desktop/src/features/<name>/` typically includes:

| File | Role |
| ---- | ---- |
| `*.schema.ts` | Zod validation |
| `*.repository.ts` | Database access and domain rules |
| `*.api.ts` | Server function entry points |
| `*.mutations.ts` | React Query mutations |
| `*.options.ts` | Query option factories |
| `*.cache.ts` | Optimistic cache updates |
| `*.keys.ts` | Query key helpers |
| `components/` | Feature-specific UI |

Identity **categories** live in `features/habits/subdomains/categories/`.

## Conventions

- Shared chrome: `src/components/layout/`
- Primitives: `src/components/ui/`
- Background jobs: `server/tasks/jobs.ts`, scheduled in `nitro.config.ts`
- User-facing product name: **Sanctuary** (see `src/config/branding.ts`)
