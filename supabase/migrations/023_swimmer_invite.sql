-- ─── 023_swimmer_invite.sql ──────────────────────────────────────────────────
-- Wires up the actual account invite for swimmers added by email
-- (previously just stored invite_email with no way to act on it — see
-- README.md "Notes / next steps"). The invite-swimmer edge function calls
-- auth.admin.inviteUserByEmail with invited_swimmer_id in user metadata;
-- this trigger links that swimmer row and sets role the instant the invited
-- user's auth account is created, before they've even set a password.

ALTER TABLE public.swimmers ADD COLUMN IF NOT EXISTS invited_at timestamptz;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_invited_swimmer_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url)
    WHERE public.profiles.email IS NULL OR public.profiles.email = '';

  v_invited_swimmer_id := (new.raw_user_meta_data->>'invited_swimmer_id')::uuid;
  IF v_invited_swimmer_id IS NOT NULL THEN
    UPDATE public.swimmers
      SET profile_id = new.id
      WHERE id = v_invited_swimmer_id AND profile_id IS NULL;
    UPDATE public.profiles SET role = 'swimmer' WHERE id = new.id AND role IS NULL;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
