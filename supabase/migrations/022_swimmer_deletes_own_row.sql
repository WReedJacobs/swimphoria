-- ─── 022_swimmer_deletes_own_row.sql ─────────────────────────────────────────
-- swimmers had SELECT (own row) and coach had FOR ALL (owns their squad), but
-- no policy ever let a swimmer DELETE their own row — needed so account
-- deletion (SettingsPage) can clean up a swimmer's own data via the
-- ON DELETE CASCADE chain (times/goals/feedback/bookings/session_assignments/
-- css_results all cascade from swimmers.id). Without this, that delete call
-- would silently affect zero rows under RLS.
DROP POLICY IF EXISTS "swimmer deletes own swimmer row" ON public.swimmers;
CREATE POLICY "swimmer deletes own swimmer row"
  ON public.swimmers FOR DELETE
  USING (profile_id = auth.uid());
