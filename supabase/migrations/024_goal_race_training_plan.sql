-- ─── 024_goal_race_training_plan.sql ─────────────────────────────────────────
-- Milestone 1 of the goal-race training plan generator. Data model only —
-- no edge function, no generation logic (that's Milestone 2).
--
-- Reconciliations against the build prompt's assumed schema (verified against
-- 001_initial.sql and the actual Session/Goal types/hooks before writing this):
--
-- 1. goal_races.swimmer_id references swimmers(id), not profiles(id) as the
--    prompt guessed — the existing `goals` table (001_initial.sql) already
--    established swimmer_id -> swimmers(id) as this app's convention, and
--    every hook (useGoals, useMySwimmer) works off the swimmers row id, not
--    the raw profile id. Matched that instead of introducing a second
--    convention.
-- 2. target_time_seconds numeric, not `interval` — every other time field in
--    this schema (times.time_seconds, goals.target_time_seconds) is
--    seconds as a number, and the frontend's formatTime/parseTime helpers
--    work in seconds. A Postgres interval would be the odd one out.
-- 3. Closed-value fields use enums (goal_event_type, goal_priority, etc.),
--    not text + check — 001_initial.sql already establishes enums as this
--    schema's convention for exactly this (swim_level, stroke_type,
--    session_kind, booking_state); text+check would be inconsistent.
-- 4. There is no existing "session-sets" table at all — sessions.warm_up/
--    main_set/cool_down are plain text, hand-assembled by SessionBuilder
--    from preset/pace-calculator insertions (see presetUtils.ts). That's
--    sufficient for Milestone 3's "editable through the existing
--    SessionBuilder" requirement (generated plans can populate those same
--    text fields), but Milestone 4 (compare actual vs. prescribed pace per
--    set) needs *structured* per-set target data to compare against, which
--    doesn't exist anywhere yet. Added plan_set_targets for that — it's a
--    secondary structured record alongside the human-readable text, not a
--    replacement for it, and SessionBuilder does not need to read/write it.
-- 5. training_availability: added directly as nullable columns on swimmers
--    (matches how squad/level/notes already live there) rather than a new
--    1:1 table.

-- ─── New enums ────────────────────────────────────────────────────────────────
create type goal_event_type as enum ('pool_sprint', 'pool_middle', 'pool_distance', 'open_water', 'triathlon_leg');
create type goal_priority as enum ('A', 'B', 'C');
create type goal_race_status as enum ('draft', 'active', 'completed', 'archived');
create type plan_phase as enum ('prep', 'base', 'build', 'peak', 'taper');
create type plan_status as enum ('draft', 'confirmed');

-- ─── goal_races ─────────────────────────────────────────────────────────────
create table goal_races (
  id uuid primary key default gen_random_uuid(),
  swimmer_id uuid not null references swimmers (id) on delete cascade,
  coach_id uuid references profiles (id) on delete set null, -- denormalised for display only; RLS derives access via swimmers
  name text not null,
  race_date date not null,
  event_type goal_event_type not null,
  distance_meters int not null check (distance_meters > 0),
  priority goal_priority not null default 'A',
  target_time_seconds numeric(8, 2) check (target_time_seconds > 0),
  status goal_race_status not null default 'draft',
  created_at timestamptz not null default now()
);

alter table goal_races enable row level security;

create policy "swimmer manages own goal races"
  on goal_races for all
  using (exists (select 1 from swimmers s where s.id = swimmer_id and s.profile_id = auth.uid()))
  with check (exists (select 1 from swimmers s where s.id = swimmer_id and s.profile_id = auth.uid()));

create policy "coach manages goal races for their swimmers"
  on goal_races for all
  using (exists (select 1 from swimmers s where s.id = swimmer_id and s.coach_id = auth.uid()))
  with check (exists (select 1 from swimmers s where s.id = swimmer_id and s.coach_id = auth.uid()));

create index goal_races_swimmer_idx on goal_races (swimmer_id);
create index goal_races_race_date_idx on goal_races (race_date);

-- ─── sessions: plan linkage ───────────────────────────────────────────────────
alter table sessions
  add column goal_race_id uuid references goal_races (id) on delete set null,
  add column plan_week_number int check (plan_week_number > 0),
  add column plan_phase plan_phase,
  add column plan_status plan_status not null default 'confirmed';

create index sessions_goal_race_idx on sessions (goal_race_id) where goal_race_id is not null;

-- ─── plan_set_targets ───────────────────────────────────────────────────────
-- Structured per-set plan data (Milestone 2's LLM tool-use output lands here),
-- separate from the human-readable text in sessions.warm_up/main_set/
-- cool_down. Milestone 4's pace-comparison logic reads this; SessionBuilder
-- does not.
create table plan_set_targets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  block text not null check (block in ('warm_up', 'main_set', 'cool_down')),
  set_order int not null default 0,
  set_type text,
  reps int not null default 1 check (reps > 0),
  distance_meters int not null check (distance_meters > 0),
  stroke stroke_type,
  target_pace_seconds numeric(8, 2) check (target_pace_seconds > 0),
  css_offset_seconds numeric(6, 2),
  rest_seconds numeric(8, 2) check (rest_seconds >= 0),
  intensity_zone text,
  created_at timestamptz not null default now()
);

alter table plan_set_targets enable row level security;

create policy "coach manages plan set targets for own sessions"
  on plan_set_targets for all
  using (exists (select 1 from sessions se where se.id = session_id and se.coach_id = auth.uid()))
  with check (exists (select 1 from sessions se where se.id = session_id and se.coach_id = auth.uid()));

create policy "swimmer reads plan set targets for assigned sessions"
  on plan_set_targets for select
  using (exists (
    select 1 from session_assignments sa
    join swimmers s on s.id = sa.swimmer_id
    where sa.session_id = plan_set_targets.session_id and s.profile_id = auth.uid()
  ));

create index plan_set_targets_session_idx on plan_set_targets (session_id);

-- ─── swimmers: training availability ──────────────────────────────────────────
alter table swimmers
  add column days_per_week int check (days_per_week between 1 and 14),
  add column session_minutes int check (session_minutes > 0),
  add column preferred_days text[];

-- ─── times: RPE (Milestone 5 training load) ──────────────────────────────────
alter table times
  add column rpe smallint check (rpe between 1 and 10);
