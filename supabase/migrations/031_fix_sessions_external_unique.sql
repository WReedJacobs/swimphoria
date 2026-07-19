-- The partial unique index from 030 can't be used as an ON CONFLICT target
-- for a plain `ON CONFLICT (external_source, external_id)` upsert (Postgres
-- requires the conflict clause's predicate to match the index's exactly).
-- A plain (non-partial) unique index works just as well here: Postgres
-- already treats NULL values as distinct for uniqueness, so ordinary
-- non-Strava sessions (both columns null) are unaffected.
drop index if exists sessions_external_unique;
create unique index sessions_external_unique on sessions (external_source, external_id);
