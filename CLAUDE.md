# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A body-recomposition tracking app for two users: workouts, nutrition,
recovery, and body composition over a multi-month program. It is a
**Vite + React 18 + TypeScript** static SPA backed by **Supabase** (Postgres +
Auth + RLS), deployed to **GitHub Pages**.

The original localStorage-only single-file prototype is archived under
`legacy/` and is no longer the app.

**Core principle:** the **7-day rolling average body weight** is the primary
metric. Daily weight is noisy; the rolling average drives decisions. Build
features around it (see `src/lib/weight.ts`).

## Commands

```sh
npm install
npm run dev        # dev server at http://localhost:5173/workout/  (note base path)
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve the production build
npm run typecheck  # tsc -b --noEmit
```

There is no test runner or linter wired up yet. After changing types or
queries, run `npm run build` - the strict `tsconfig` catches most issues.

Local dev needs `.env.local` with `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` (see `.env.example`). Without them the app throws on
boot by design (`src/lib/supabase.ts` fails fast).

## Architecture

- **Routing:** `HashRouter` (in `src/main.tsx`). Required - GitHub Pages 404s
  on non-hash deep links. Keep using hash routes.
- **Base path:** `base: '/workout/'` in `vite.config.ts`, matching the repo
  name. The dev server and all asset URLs live under `/workout/`.
- **Auth:** `src/auth/AuthContext.tsx` wraps the app, exposes `useAuth()`
  (`session`, `user`, `signIn`, `signOut`). `App.tsx` gates on `session`:
  no session -> `<Login>`, otherwise the routed pages.
- **Data access:** the typed client is `src/lib/supabase.ts`
  (`createClient<Database>`). Feature data is fetched via small hooks
  (`useProfile`, `useWeightSeries`) that own their own loading + `reload`.
- **Styling:** Tailwind v4 via `@tailwindcss/vite` (`@import "tailwindcss"` in
  `src/index.css`). Dark theme, mobile-first. Shared primitives in
  `src/components/ui.tsx` (`Card`, `Button`, `Input`, `Field`, `StatTile`) -
  reuse these rather than ad-hoc class soup.
- **Charts:** Recharts, code-split into its own chunk in `vite.config.ts`.

Feature code is organized by domain under `src/features/<domain>/`
(component + hook + helpers together), pages under `src/pages/`.

## Supabase schema & the type contract

SQL lives in `supabase/migrations/` and is run by hand in the Supabase SQL
Editor. `0001_init.sql` = schema + RLS. `0002_seed.example.sql` is a
PII-free placeholder template; the real seed is a gitignored `*.local.sql`
copy filled with real UUIDs/values (personal data must never be committed -
the repo is public; it lives only in Supabase).

`src/lib/database.types.ts` is **hand-authored to mirror the migrations** -
when you change a table, change both. Critical gotcha: the table row types MUST
be `type` aliases, **not `interface`**. Supabase's typed client requires
`Row`/`Insert`/`Update` to satisfy `Record<string, unknown>`, and interfaces
lack the implicit index signature, which silently makes every query resolve to
`never`.

Tables: `profiles`, `daily_logs` (unique `(user_id, log_date)`, **upserted** -
one row per user per day), `workout_sessions` + `workout_sets`,
`program_templates` (seeded, read-only).

## Security model (do not weaken without asking)

The anon key ships in the public bundle, so **RLS is the entire security
boundary**. The model is "partner read-only":

- `SELECT`: any authenticated user (only the two of them have accounts; public
  signup is disabled).
- `INSERT`/`UPDATE`/`DELETE`: owner only (`user_id = auth.uid()`).

Every new table needs RLS enabled with policies on all four verbs. Never use
the `service_role` key client-side. `workout_sets` carries a denormalized
`user_id` so its RLS check needs no join - keep that pattern for child tables.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to Pages on push to `main`.
`VITE_*` vars are inlined at build time, so they must exist as repo Actions
secrets; the workflow fails fast if they are missing. Pages source must be set
to "GitHub Actions" in repo settings.
