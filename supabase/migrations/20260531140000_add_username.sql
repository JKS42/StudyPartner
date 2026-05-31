-- Add unique username to profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Case-insensitive unique usernames (ignore empty)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL AND TRIM(username) <> '';

-- Format: 3–20 chars, start with letter, then letters/numbers/underscore
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (
    username IS NULL
    OR (
      CHAR_LENGTH(username) >= 3
      AND CHAR_LENGTH(username) <= 20
      AND username ~ '^[a-zA-Z][a-zA-Z0-9_]*$'
    )
  );
