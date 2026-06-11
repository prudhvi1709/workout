-- Recomp Tracker - initial schema + RLS
-- Run this in the Supabase SQL Editor (one paste, top to bottom).
--
-- Security model: "partner read-only".
--   * Any authenticated user may SELECT all rows (only the two users have
--     accounts, and public signup is disabled - see SETUP notes at bottom).
--   * INSERT / UPDATE / DELETE are restricted to the row owner (user_id = auth.uid()).
-- RLS is the ONLY security boundary because the anon key ships in the public
-- bundle. Every table below has RLS enabled with policies on all four verbs.

create type public.sex as enum ('male', 'female');

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  sex public.sex,
  height_cm numeric(5, 1),
  start_weight_kg numeric(5, 1),
  goal_weight_kg numeric(5, 1),
  birthday_goal_weight_kg numeric(5, 1),
  goal_date date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- daily_logs: one row per user per calendar day (upserted)
-- ---------------------------------------------------------------------------
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  morning_weight_kg numeric(5, 2),
  waist_cm numeric(5, 1),
  body_fat_pct numeric(4, 1),
  calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  water_l numeric(4, 2),
  steps integer,
  cardio_min integer,
  bike_commute boolean not null default false,
  swimming boolean not null default false,
  sleep_hours numeric(4, 2),
  sleep_quality smallint check (sleep_quality between 1 and 10),
  energy_score smallint check (energy_score between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index daily_logs_user_date_idx on public.daily_logs (user_id, log_date);

-- keep updated_at fresh on every write
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_logs_touch_updated_at
before update on public.daily_logs
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- workout_sessions + workout_sets
-- ---------------------------------------------------------------------------
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  day_label text,
  notes text,
  created_at timestamptz not null default now()
);

create index workout_sessions_user_date_idx on public.workout_sessions (user_id, session_date);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  -- denormalized owner so RLS can be checked without a join
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_name text not null,
  weight_kg numeric(6, 2),
  sets smallint,
  reps smallint,
  rir smallint,
  position smallint not null default 0,
  notes text
);

create index workout_sets_session_idx on public.workout_sets (session_id);

-- ---------------------------------------------------------------------------
-- program_templates: the seeded Week 1-4 weekly plan, keyed by user_id (seeded
-- after accounts exist). Read-only reference data; no names stored here.
-- ---------------------------------------------------------------------------
create table public.program_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_label text not null,
  exercise_name text not null,
  target_sets smallint,
  target_reps text,
  position smallint not null default 0
);

create index program_templates_user_idx on public.program_templates (user_id, day_label, position);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.program_templates enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles: authenticated can read"
  on public.profiles for select to authenticated using (true);
create policy "profiles: owner can insert"
  on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles: owner can update"
  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: owner can delete"
  on public.profiles for delete to authenticated using (id = auth.uid());

-- daily_logs ----------------------------------------------------------------
create policy "daily_logs: authenticated can read"
  on public.daily_logs for select to authenticated using (true);
create policy "daily_logs: owner can insert"
  on public.daily_logs for insert to authenticated with check (user_id = auth.uid());
create policy "daily_logs: owner can update"
  on public.daily_logs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "daily_logs: owner can delete"
  on public.daily_logs for delete to authenticated using (user_id = auth.uid());

-- workout_sessions ----------------------------------------------------------
create policy "workout_sessions: authenticated can read"
  on public.workout_sessions for select to authenticated using (true);
create policy "workout_sessions: owner can insert"
  on public.workout_sessions for insert to authenticated with check (user_id = auth.uid());
create policy "workout_sessions: owner can update"
  on public.workout_sessions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workout_sessions: owner can delete"
  on public.workout_sessions for delete to authenticated using (user_id = auth.uid());

-- workout_sets --------------------------------------------------------------
create policy "workout_sets: authenticated can read"
  on public.workout_sets for select to authenticated using (true);
create policy "workout_sets: owner can insert"
  on public.workout_sets for insert to authenticated with check (user_id = auth.uid());
create policy "workout_sets: owner can update"
  on public.workout_sets for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workout_sets: owner can delete"
  on public.workout_sets for delete to authenticated using (user_id = auth.uid());

-- program_templates ---------------------------------------------------------
-- Read-only reference data for everyone authenticated; no client writes.
create policy "program_templates: authenticated can read"
  on public.program_templates for select to authenticated using (true);

-- ===========================================================================
-- Table GRANTs
-- ===========================================================================
-- RLS decides WHICH rows; GRANTs decide whether the role may touch the table
-- at all. PostgREST needs both. This project does not auto-grant, so set them
-- explicitly. The `anon` role gets nothing (login happens via /auth, not via
-- table reads), so unauthenticated table access is impossible - defense in
-- depth on top of the "to authenticated" policies above.
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles, public.daily_logs, public.workout_sessions, public.workout_sets
  to authenticated;
grant select on public.program_templates to authenticated;

-- ===========================================================================
-- SETUP (do this once, after running the schema above)
-- ===========================================================================
-- 1. Authentication > Providers > Email: turn OFF "Enable signup" so the app
--    has no open registration endpoint.
-- 2. Authentication > Users > "Add user" twice (set passwords, mark confirmed):
--       prudhvi@example.com   and   srikari@example.com   (use real emails)
-- 3. Copy each new user's UUID, then create their profile + program by copying
--    supabase/migrations/0002_seed.example.sql, filling in real UUIDs and your
--    real personal values, and running it in the SQL editor. Keep your filled
--    copy PRIVATE - do not commit it (the repo is public; *.local.sql is
--    gitignored). No personal data ever lives in the repo, only in this DB.
--
-- ===========================================================================
-- RLS isolation smoke test (run in SQL editor while impersonating, or verify
-- from the app): logged in as one user, an UPDATE/DELETE targeting the other
-- user's daily_logs row must affect 0 rows, while SELECT returns both users' rows.
-- ===========================================================================
