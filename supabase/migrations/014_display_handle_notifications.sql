-- Optional public handle shown in leaderboard instead of full_name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_handle text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_handle_unique
  ON profiles (display_handle) WHERE display_handle IS NOT NULL;

-- In-app notification inbox
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text        NOT NULL,
  message    text        NOT NULL,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications (user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
