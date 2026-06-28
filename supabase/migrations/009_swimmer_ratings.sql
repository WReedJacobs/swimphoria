-- ─── is_public on profiles ──────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- ─── Helper admin check function ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true);
$$;

-- ─── swimmer_stats table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swimmer_stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  ovr             integer DEFAULT 30,
  prev_ovr        integer DEFAULT 30,
  spd             integer DEFAULT 20,
  end_stat        integer DEFAULT 20,
  tec             integer DEFAULT 20,
  con             integer DEFAULT 25,
  prg             integer DEFAULT 15,
  com             integer DEFAULT 25,
  tier            text DEFAULT 'rookie',
  last_calculated timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.swimmer_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own stats"       ON public.swimmer_stats;
DROP POLICY IF EXISTS "Users update own stats"     ON public.swimmer_stats;
DROP POLICY IF EXISTS "Public leaderboard read"    ON public.swimmer_stats;
DROP POLICY IF EXISTS "Admins manage stats"        ON public.swimmer_stats;

CREATE POLICY "Users read own stats" ON public.swimmer_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own stats" ON public.swimmer_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public leaderboard read" ON public.swimmer_stats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND is_public = true)
  );

CREATE POLICY "Admins manage stats" ON public.swimmer_stats
  FOR ALL USING (public.is_admin());

-- ─── Auto-create stats row when profile is created ──────────────────────────
CREATE OR REPLACE FUNCTION public.create_default_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.swimmer_stats (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_stats();

-- ─── Backfill existing users ─────────────────────────────────────────────────
INSERT INTO public.swimmer_stats (user_id)
  SELECT id FROM public.profiles ON CONFLICT DO NOTHING;
