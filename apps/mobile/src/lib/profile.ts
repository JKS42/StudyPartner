/** Normalize user input to a canonical username (lowercase, trimmed). */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, '');
}

/** Returns null if valid, or an error message. */
export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!username) return null; // empty clears username on save handled separately

  if (username.length < 3) return 'Username must be at least 3 characters.';
  if (username.length > 20) return 'Username must be 20 characters or fewer.';
  if (!/^[a-z][a-z0-9_]*$/i.test(username)) {
    return 'Use letters, numbers, and underscores. Must start with a letter.';
  }
  if (username.includes('__')) return 'Username cannot contain consecutive underscores.';

  return null;
}

/** Preferred name for UI: @username, display name, or fallback. */
export function getProfileDisplayName(profile: {
  username?: string | null;
  display_name?: string | null;
} | null | undefined): string {
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  if (profile?.username?.trim()) return `@${profile.username.trim()}`;
  return 'Student';
}

/** Name shown in "Hello, …" — username wins when set. */
export function getProfileGreetingName(profile: {
  username?: string | null;
  display_name?: string | null;
} | null | undefined): string {
  if (profile?.username?.trim()) return profile.username.trim();
  if (profile?.display_name?.trim()) return profile.display_name.trim().split(' ')[0];
  return 'Student';
}

export function getProfileHandle(profile: {
  username?: string | null;
} | null | undefined): string | null {
  const u = profile?.username?.trim();
  return u ? `@${u}` : null;
}
