-- Join code system: coaches share a 6-char code, swimmers redeem it to link accounts.

ALTER TABLE profiles ADD COLUMN join_code text UNIQUE;

-- RPC: called by a swimmer to join a coach's roster.
-- SECURITY DEFINER runs as DB owner so it can write across tables
-- without needing additional swimmer-side RLS policies.
CREATE OR REPLACE FUNCTION join_coach(p_join_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coach_id        uuid;
  v_swimmer_name    text;
  v_swimmer_level   swim_level;
  v_swimmer_row_id  uuid;
BEGIN
  -- Resolve coach by code (case-insensitive)
  SELECT id INTO v_coach_id
  FROM profiles
  WHERE join_code = upper(trim(p_join_code)) AND role = 'coach';

  IF v_coach_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid join code — check with your coach and try again');
  END IF;

  IF v_coach_id = auth.uid() THEN
    RETURN json_build_object('error', 'You cannot join yourself');
  END IF;

  IF EXISTS (
    SELECT 1 FROM swimmers
    WHERE coach_id = v_coach_id AND profile_id = auth.uid()
  ) THEN
    RETURN json_build_object('error', 'Already connected to this coach');
  END IF;

  SELECT full_name, COALESCE(level, 'beginner')
  INTO v_swimmer_name, v_swimmer_level
  FROM profiles WHERE id = auth.uid();

  -- Repurpose self-managed row created during onboarding if one exists
  UPDATE swimmers
  SET coach_id = v_coach_id
  WHERE profile_id = auth.uid() AND coach_id = auth.uid()
  RETURNING id INTO v_swimmer_row_id;

  IF v_swimmer_row_id IS NULL THEN
    INSERT INTO swimmers (coach_id, profile_id, display_name, level)
    VALUES (v_coach_id, auth.uid(), COALESCE(v_swimmer_name, 'Swimmer'), v_swimmer_level)
    RETURNING id INTO v_swimmer_row_id;
  END IF;

  UPDATE profiles SET coach_id = v_coach_id WHERE id = auth.uid();

  RETURN json_build_object('success', true, 'swimmer_id', v_swimmer_row_id);
END;
$$;
