-- ─── 025_fix_sessions_recursion.sql ───────────────────────────────────────────
-- Pre-existing bug, not introduced by 024 but surfaced while verifying it:
-- querying `sessions` at all (even an untouched column like `title`) throws
-- "infinite recursion detected in policy for relation sessions" for any
-- caller that isn't a session's own coach. Root cause, both from
-- 001_initial.sql:
--
--   sessions "swimmer reads assigned sessions"  -> queries session_assignments
--   session_assignments "coach manages assignments" -> queries sessions
--
-- Two tables whose RLS policies each query the other — same class of bug as
-- 008's "admin full access to profiles" (fixed in 008/is_admin()), same fix:
-- a SECURITY DEFINER helper so the session_assignments side of the cycle
-- doesn't re-trigger sessions' RLS. Breaking one side of the cycle is
-- sufficient. 024's plan_set_targets policies reference both of these
-- tables and inherited this same failure without adding a new cycle of
-- their own — this fix resolves those too.

create or replace function public.is_session_coach(p_session_id uuid, p_uid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.sessions se
    where se.id = p_session_id and se.coach_id = p_uid
  );
$$;

drop policy if exists "coach manages assignments" on session_assignments;
create policy "coach manages assignments"
  on session_assignments for all
  using (public.is_session_coach(session_id, auth.uid()))
  with check (public.is_session_coach(session_id, auth.uid()));
