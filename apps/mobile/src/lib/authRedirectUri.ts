import { makeRedirectUri } from 'expo-auth-session';

/** Must match Supabase Auth → URL configuration → Redirect URLs */
export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'studypartner',
    path: 'auth/callback',
  });
}
