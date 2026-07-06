-- Pool course on every time (SCM = short-course metres, LCM = long-course, SCY = yards)
ALTER TABLE times ADD COLUMN IF NOT EXISTS course text
  CHECK (course IN ('SCM', 'LCM', 'SCY')) NOT NULL DEFAULT 'SCM';

-- Lap splits captured from the stopwatch
CREATE TABLE IF NOT EXISTS splits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  time_id     uuid        NOT NULL REFERENCES times(id) ON DELETE CASCADE,
  lap_number  int         NOT NULL CHECK (lap_number > 0),
  split_seconds numeric(8, 2) NOT NULL CHECK (split_seconds > 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS splits_time_id_idx ON splits (time_id);

ALTER TABLE splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "splits_select" ON splits FOR SELECT USING (
  time_id IN (
    SELECT id FROM times WHERE
      coach_id = auth.uid()
      OR swimmer_id IN (SELECT id FROM swimmers WHERE profile_id = auth.uid())
  )
);
CREATE POLICY "splits_insert" ON splits FOR INSERT WITH CHECK (
  time_id IN (
    SELECT id FROM times WHERE
      coach_id = auth.uid()
      OR swimmer_id IN (SELECT id FROM swimmers WHERE profile_id = auth.uid())
  )
);
CREATE POLICY "splits_delete" ON splits FOR DELETE USING (
  time_id IN (
    SELECT id FROM times WHERE
      coach_id = auth.uid()
      OR swimmer_id IN (SELECT id FROM swimmers WHERE profile_id = auth.uid())
  )
);
