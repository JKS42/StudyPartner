-- Push notifications: tokens + profile preferences

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS local_reminders_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_hour INT DEFAULT 18 CHECK (reminder_hour >= 0 AND reminder_hour <= 23);

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  device_id TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web', 'unknown')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);

CREATE TRIGGER push_tokens_updated_at BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id);
