-- 018_set_presets.sql
-- Preset Set Library: global seed presets + user-owned custom presets

-- ─── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE public.set_presets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  category    text        NOT NULL
                CHECK (category IN (
                  'warmup','endurance','threshold','sprint','kick','pull',
                  'technique','medley','pyramid','race_pace','recovery',
                  'cooldown','test'
                )),
  level       swim_level  NOT NULL DEFAULT 'beginner',
  stroke      stroke_type,
  reps        int         NOT NULL DEFAULT 1,
  distance    int         NOT NULL DEFAULT 100,
  rest_type   text        NOT NULL DEFAULT 'rest_seconds'
                CHECK (rest_type IN (
                  'rest_seconds','interval_seconds','css_offset','none'
                )),
  rest_value  numeric,
  equipment   text[]      NOT NULL DEFAULT '{}',
  description text        NOT NULL DEFAULT '',
  structure   jsonb,
  family      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX set_presets_owner_idx    ON public.set_presets (owner_id);
CREATE INDEX set_presets_category_idx ON public.set_presets (category);
CREATE INDEX set_presets_level_idx    ON public.set_presets (level);
CREATE INDEX set_presets_family_idx   ON public.set_presets (family)
  WHERE family IS NOT NULL;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.set_presets ENABLE ROW LEVEL SECURITY;

-- Global presets (owner_id IS NULL) are readable by all authenticated users.
-- Anon users hit the static presetCatalog.ts instead (see beginner surface).
CREATE POLICY "read global presets"
  ON public.set_presets FOR SELECT
  USING (owner_id IS NULL);

-- Users can read, create, update, and delete their own presets
CREATE POLICY "read own presets"
  ON public.set_presets FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "insert own presets"
  ON public.set_presets FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "update own presets"
  ON public.set_presets FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "delete own presets"
  ON public.set_presets FOR DELETE
  USING (owner_id = auth.uid());
