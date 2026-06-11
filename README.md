# Recomp Tracker

A small two-user tracker for body weight, workouts, nutrition and recovery.

Static **Vite + React 18 + TypeScript** SPA, backed by **Supabase** (Postgres +
Auth + Row Level Security), deployed to **GitHub Pages**. Mobile-first, dark
theme.

The central metric is the **7-day rolling average body weight** (trailing 7
calendar days, gap-tolerant) computed in `src/lib/weight.ts`.

## Commands

```sh
npm install
npm run dev        # http://localhost:5173/workout/  (note the base path)
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve the production build
npm run typecheck  # tsc -b --noEmit
npm run test:e2e   # Playwright smoke tests (mobile + desktop)
```

Local dev needs `.env.local` with `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` (see `.env.example`). Without them the app throws on
boot by design.

## Supabase setup (once)

1. Create a project at <https://supabase.com>.
2. **SQL Editor**: run `supabase/migrations/0001_init.sql` (schema + RLS + grants).
3. **Authentication > Providers > Email**: turn **off** "Enable signup" (no
   public registration; accounts are created by hand).
4. **Authentication > Users > Add user**: create the two accounts (real emails,
   passwords, marked confirmed).
5. Seed profiles + program privately:
   ```sh
   cp supabase/migrations/0002_seed.example.sql supabase/migrations/0002_seed.local.sql
   ```
   Edit the `*.local.sql` copy with real UUIDs/values and run it in the SQL
   Editor. `*.local.sql` is gitignored.

## Deploy to GitHub Pages

1. **Settings > Secrets and variables > Actions**: add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
2. **Settings > Pages > Source: GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` builds and deploys to
   `https://<user>.github.io/workout/`.

`VITE_`-prefixed vars are inlined at build time; the workflow fails fast if the
secrets are missing.

## Security model

The anon key ships in the public bundle, so **RLS is the entire security
boundary** ("partner read-only"):

- `SELECT`: any authenticated user (only the two accounts exist; signup is off).
- `INSERT` / `UPDATE` / `DELETE`: owner only (`user_id = auth.uid()`).

The `service_role` key is never used client-side. The public site shows only a
login screen; no row is readable without signing in.

## Architecture

| Area | Choice | Notes |
| --- | --- | --- |
| Build | Vite + React 18 + TS | Static output for Pages |
| Routing | `HashRouter` | Avoids 404s on Pages deep links |
| Base path | `/workout/` in `vite.config.ts` | Matches the repo name |
| Styling | Tailwind v4 (`@tailwindcss/vite`) | Mobile-first, dark theme |
| Charts | Recharts | Code-split into its own chunk |
| Data | `@supabase/supabase-js` | Typed via `src/lib/database.types.ts` |

### Data model (`supabase/migrations/0001_init.sql`)

- `profiles` - one row per user.
- `daily_logs` - one row per user per day, unique on `(user_id, log_date)`, upserted.
- `workout_sessions` + `workout_sets` - session header and its exercise rows
  (`workout_sets` carries a denormalized `user_id` so its RLS check needs no join).
- `program_templates` - seeded plan keyed by `user_id` (read-only).

`src/lib/database.types.ts` is hand-authored to mirror the migrations; row
types must be `type` aliases, not `interface` (interfaces lack the implicit
index signature the Supabase client requires).

The previous localStorage-only prototype is archived under `legacy/`.
