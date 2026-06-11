-- Recomp Tracker - seed TEMPLATE (no personal data).
--
-- This is the only seed file committed to the (public) repo. It contains NO
-- real names, weights, goals, or dates - only placeholders. To use it:
--
--   1. Copy it to a PRIVATE file that is NOT committed, e.g.
--        supabase/migrations/0002_seed.local.sql   (*.local.sql is gitignored)
--   2. Fill in the real UUIDs (Authentication > Users) and your real values.
--   3. Run that private copy in the Supabase SQL Editor.
--
-- Your personal data then lives ONLY in the Supabase database (protected by
-- Auth + RLS), never in the public repo.
--
-- Run this AFTER 0001_init.sql and after creating the two users.

-- Replace every PASTE_USER1_UUID / PASTE_USER2_UUID below with the real UUIDs.

-- ---------------------------------------------------------------------------
-- Profiles  (fill in real display name + body metrics privately)
-- ---------------------------------------------------------------------------
insert into public.profiles
  (id, display_name, sex, height_cm, start_weight_kg, goal_weight_kg, birthday_goal_weight_kg, goal_date)
values
  ('PASTE_USER1_UUID', 'User One', 'male',   170.0, 100.0, 80.0, 90.0, '2026-09-17'),
  ('PASTE_USER2_UUID', 'User Two', 'female', 163.0,  78.0, 65.0, 71.0, '2026-09-23')
on conflict (id) do update set
  display_name = excluded.display_name,
  sex = excluded.sex,
  height_cm = excluded.height_cm,
  start_weight_kg = excluded.start_weight_kg,
  goal_weight_kg = excluded.goal_weight_kg,
  birthday_goal_weight_kg = excluded.birthday_goal_weight_kg,
  goal_date = excluded.goal_date;

-- ---------------------------------------------------------------------------
-- Program templates (Athletic Rebuild Phase, Weeks 1-4), keyed by user_id.
-- Exercise routines are not personal data; adjust to taste.
-- ---------------------------------------------------------------------------
delete from public.program_templates where user_id in ('PASTE_USER1_UUID', 'PASTE_USER2_UUID');

-- USER 1 - 5-day upper/lower split
insert into public.program_templates (user_id, day_label, exercise_name, target_sets, target_reps, position) values
  ('PASTE_USER1_UUID', 'Mon - Upper A', 'Machine Chest Press',     3, '10', 0),
  ('PASTE_USER1_UUID', 'Mon - Upper A', 'Lat Pulldown',            3, '10', 1),
  ('PASTE_USER1_UUID', 'Mon - Upper A', 'Seated Cable Row',        3, '12', 2),
  ('PASTE_USER1_UUID', 'Mon - Upper A', 'Incline Dumbbell Press',  3, '10', 3),
  ('PASTE_USER1_UUID', 'Mon - Upper A', 'Lateral Raise',           3, '15', 4),
  ('PASTE_USER1_UUID', 'Mon - Upper A', 'Rope Pushdown',           3, '12', 5),
  ('PASTE_USER1_UUID', 'Tue - Lower A', 'Leg Press',               4, '10', 0),
  ('PASTE_USER1_UUID', 'Tue - Lower A', 'Goblet Squat',            3, '10', 1),
  ('PASTE_USER1_UUID', 'Tue - Lower A', 'Romanian Deadlift (light)', 3, '10', 2),
  ('PASTE_USER1_UUID', 'Tue - Lower A', 'Leg Curl',                3, '12', 3),
  ('PASTE_USER1_UUID', 'Tue - Lower A', 'Calf Raise',              3, '15', 4),
  ('PASTE_USER1_UUID', 'Tue - Lower A', 'Plank',                   3, 'rounds', 5),
  ('PASTE_USER1_UUID', 'Wed - Recovery', 'Treadmill',              null, '15 min', 0),
  ('PASTE_USER1_UUID', 'Wed - Recovery', 'Cycling',                null, '15 min', 1),
  ('PASTE_USER1_UUID', 'Wed - Recovery', 'Mobility Work',          null, '-', 2),
  ('PASTE_USER1_UUID', 'Thu - Upper B', 'Lat Pulldown',            4, '10', 0),
  ('PASTE_USER1_UUID', 'Thu - Upper B', 'Machine Shoulder Press',  3, '10', 1),
  ('PASTE_USER1_UUID', 'Thu - Upper B', 'Chest Supported Row',     3, '10', 2),
  ('PASTE_USER1_UUID', 'Thu - Upper B', 'Pec Deck',                3, '12', 3),
  ('PASTE_USER1_UUID', 'Thu - Upper B', 'Cable Lateral Raise',     3, '15', 4),
  ('PASTE_USER1_UUID', 'Thu - Upper B', 'Hammer Curl',             3, '12', 5),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Leg Press',             3, '12', 0),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Machine Chest Press',   3, '12', 1),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Lat Pulldown',          3, '12', 2),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Cable Row',             3, '12', 3),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Dumbbell Romanian Deadlift', 2, '12', 4),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Lateral Raise',         3, '15', 5),
  ('PASTE_USER1_UUID', 'Fri - Full Body', 'Hanging Knee Raise',    3, '12', 6);

-- USER 2 - beginner full-body + cardio
insert into public.program_templates (user_id, day_label, exercise_name, target_sets, target_reps, position) values
  ('PASTE_USER2_UUID', 'Mon', 'Chest Press Machine',  2, '12', 0),
  ('PASTE_USER2_UUID', 'Mon', 'Lat Pulldown',         2, '12', 1),
  ('PASTE_USER2_UUID', 'Mon', 'Seated Row',           2, '12', 2),
  ('PASTE_USER2_UUID', 'Mon', 'Glute Bridge',         2, '15', 3),
  ('PASTE_USER2_UUID', 'Tue - Cardio', 'Treadmill',   null, '10 min', 0),
  ('PASTE_USER2_UUID', 'Tue - Cardio', 'Cycling',     null, '10 min', 1),
  ('PASTE_USER2_UUID', 'Wed', 'Goblet Squat',         2, '12', 0),
  ('PASTE_USER2_UUID', 'Wed', 'Lat Pulldown',         2, '12', 1),
  ('PASTE_USER2_UUID', 'Wed', 'Dumbbell Shoulder Press', 2, '12', 2),
  ('PASTE_USER2_UUID', 'Wed', 'Glute Bridge',         2, '15', 3),
  ('PASTE_USER2_UUID', 'Wed', 'Farmer Carry',         2, 'rounds', 4),
  ('PASTE_USER2_UUID', 'Thu - Cardio', 'Treadmill',   null, '15 min', 0),
  ('PASTE_USER2_UUID', 'Thu - Cardio', 'Cycling',     null, '10 min', 1),
  ('PASTE_USER2_UUID', 'Fri (repeat Mon)', 'Chest Press Machine', 2, '12', 0),
  ('PASTE_USER2_UUID', 'Fri (repeat Mon)', 'Lat Pulldown',        2, '12', 1),
  ('PASTE_USER2_UUID', 'Fri (repeat Mon)', 'Seated Row',          2, '12', 2),
  ('PASTE_USER2_UUID', 'Fri (repeat Mon)', 'Glute Bridge',        2, '15', 3);
