# Sanctuary website

Astro landing page for Sanctuary. Built separately from the desktop app; published to GitHub Pages.

## Commands

| Command        | Action                         |
| -------------- | ------------------------------ |
| `pnpm install` | Install dependencies           |
| `pnpm dev`     | Dev server at `localhost:4321` |
| `pnpm build`   | Production build → `dist/`     |
| `pnpm preview` | Preview the build              |

From the monorepo root: `pnpm dev:website`

## Pages

- `/` — landing page with download links
- `/guides` — user and developer guides

Site URL: `https://rajeshepili.github.io/sanctuary/` (see `astro.config.mjs` for `base`).

Markdown docs for the repo live in the root `docs/` folder, not inside this app.
