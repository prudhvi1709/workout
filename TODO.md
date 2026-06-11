# TODO / Roadmap

Working reference for the recomp tracker. Priorities top-down. No personal data
here (public repo) - real numbers live in Supabase + the local seed.

## Done (MVP)

- [x] Supabase Auth + RLS "partner read-only" model; fail-fast client.
- [x] Dashboard: morning weigh-in, **7-day rolling-average** trend chart, goal progress.
- [x] Workout logger: date-based sessions, per-exercise Google search, weight/sets/reps/RIR/notes.
- [x] Advisory progression: prefill last session's weight + a "last time / consider a bump" hint (never auto-applied).
- [x] Per-exercise "why this helps" lines.
- [x] Evidence-based program seeds (barbell-led, back-sparing; beginner full-body kept light).
- [x] GitHub Pages deploy, Playwright smoke tests, favicon, README.

## Next up (priority order)

- [x] **Full daily-log form** (`src/pages/Daily.tsx`, `/daily` route + nav tab).
      Prefills the day's row, upserts the whole row on (user_id, log_date):
      body (weight, waist, body-fat), nutrition (calories, protein, carbs, fat,
      water), activity (steps, cardio_min, bike_commute, swimming), recovery
      (sleep_hours, sleep_quality, energy_score), notes.
- [ ] **Nutrition targets + tracking.** Per-user calorie + protein targets (scale
      protein to fat-free mass / target weight, not scale weight). Show intake vs target.
- [ ] **Weekly review screen.** Rolling-avg delta vs target rate, avg calories/protein
      vs target, training days hit, avg sleep/energy - one place that drives decisions.
- [ ] **Analytics / alerts engine** (pure fns in `src/lib`): weight plateau (rolling
      avg flat 2-3 wk -> trim calories), losing too fast (>1%/wk -> eat more), low
      protein, sleep/recovery risk. Suggestions only, never auto-change.
- [ ] **Adherence scoring.**

## Later / nice-to-have

- [ ] Workout history view (past sessions, per-exercise load/volume trend, PRs).
- [ ] Block / phase rotation: deload + exercise swaps after ~4-6 weeks (a "new block"
      action rather than hand-editing SQL).
- [ ] Partner read-only view (toggle to see the other user's dashboard).
- [ ] Profile / goals editing UI (currently set only via the seed).
- [ ] Body-composition chart (waist, body-fat over time).

## Tech debt / housekeeping

- [ ] No linter wired up - consider ESLint + a typecheck step in CI.
- [ ] `recharts` chunk is >500 kB - acceptable, but could lazy-load the chart route.
- [ ] Tests are smoke-only - add unit tests for `weight.ts` (rolling average) and
      `progression.ts` (rep-range parser / hint).
- [ ] Progression weights prefill only if last-performance has loaded before a day is
      picked - minor; reselect to refresh.
