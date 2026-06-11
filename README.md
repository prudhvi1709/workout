# Recomp Tracker

A workout, nutrition, recovery, and body-composition tracker for two users
running a multi-month fat-loss / recomposition program.

Built as a static **Vite + React + TypeScript** app, backed by **Supabase**
(Postgres + Auth + Row Level Security), deployed to **GitHub Pages**.

The primary metric throughout is the **7-day rolling average body weight** -
daily weight is noisy, the rolling average is the real signal used for
nutrition and training decisions.

## Status

Built so far: auth; morning weigh-in + weight-trend chart (daily + 7-day
rolling average + weekly average); and a mobile workout logger (pick a program
day, log weight/sets/reps/RIR/notes per exercise). Full daily logging
(nutrition / activity / recovery) and the analytics engine (alerts, adherence
scoring) are the next slices.

## One-time setup

### 1. Create the Supabase project

1. Create a free project at <https://supabase.com>.
2. In **SQL Editor**, paste and run `supabase/migrations/0001_init.sql`
   (schema + RLS policies).
3. In **Authentication > Providers > Email**, turn **off** "Enable signup"
   (the app has no registration flow; accounts are created manually).
4. In **Authentication > Users > Add user**, create the two accounts with real
   emails and passwords, and mark them confirmed.
5. Seed profiles + program **privately** (this is where your personal data
   goes - keep it out of the repo):
   ```sh
   cp supabase/migrations/0002_seed.example.sql supabase/migrations/0002_seed.local.sql
   ```
   Edit `0002_seed.local.sql`: replace the `PASTE_USER*_UUID` placeholders with
   the real UUIDs and fill in real names / heights / weights / goals. Run it in
   the SQL Editor. `*.local.sql` is gitignored, so your real data never gets
   committed.

> The Supabase **anon key** is safe to expose publicly - it ships in the
> client bundle by design. RLS is the real security boundary, so the migration
> locks writes to the row owner and allows reads to either signed-in partner.

## Privacy

This repo is **public** (GitHub Pages requires it on the free tier), so treat
the code as public. Your **personal data is not in the repo** - names, weights,
goals and all logs live only in the Supabase database, gated by Auth + RLS. A
visitor to the public site sees only a login screen and cannot read any row
without signing in as one of the two accounts.

To keep it that way:

- Never commit a filled `*.local.sql` (it is gitignored).
- The committed `0002_seed.example.sql` contains only placeholders.
- If you want the **code** private too, deploy from a private repo on Vercel or
  Netlify (free, supports private repos) instead of GitHub Pages.

### 2. Local development

```sh
npm install
cp .env.example .env.local   # fill in your project URL + anon key
npm run dev                  # serves at http://localhost:5173/workout/
```

Get the URL and anon key from Supabase **Settings > API**.

### 3. Deploy to GitHub Pages

1. Repo **Settings > Secrets and variables > Actions > New repository secret**,
   add both:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Repo **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and
   deploys. Live at `https://<user>.github.io/workout/`.

> `VITE_`-prefixed vars are inlined **at build time**. The workflow fails fast
> if the secrets are missing, so a broken (Supabase-less) build is never shipped.

## Architecture

| Area | Choice | Notes |
| --- | --- | --- |
| Build | Vite + React 18 + TS | Static output, deployable on Pages |
| Routing | `react-router-dom` `HashRouter` | Avoids 404s on Pages deep links |
| Base path | `/workout/` in `vite.config.ts` | Matches the repo name |
| Styling | Tailwind v4 (`@tailwindcss/vite`) | Mobile-first, dark theme |
| Charts | Recharts | Split into its own chunk |
| Data | Supabase JS client | Typed via `src/lib/database.types.ts` |

### Data model (`supabase/migrations/0001_init.sql`)

- `profiles` - one per user (goals, height, goal date).
- `daily_logs` - one row per user per day, unique on `(user_id, log_date)`,
  upserted. Holds body / nutrition / activity / recovery fields.
- `workout_sessions` + `workout_sets` - session header and its exercise rows.
- `program_templates` - the seeded weekly plan, keyed by `user_id` (read-only).

### Key modules

- `src/lib/weight.ts` - builds the trend series and the 7-day rolling average
  (trailing 7 **calendar** days, gap-tolerant). This is the core metric.
- `src/auth/` - Supabase session context + login.
- `src/features/weight/` - weigh-in form, chart, data hook.

### Security checklist (verify after setup)

- [ ] Public signup disabled.
- [ ] Logged in as one user, a `SELECT` returns both users' rows (partner
      read-only is intended); an `UPDATE`/`DELETE` against the other user's
      row affects **0 rows**.
- [ ] `service_role` key is never used client-side (only the anon key is).

The previous localStorage-only prototype is archived under `legacy/`.
