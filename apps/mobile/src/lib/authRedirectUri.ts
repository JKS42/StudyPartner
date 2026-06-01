import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/**
 * OAuth redirect URI sent to Supabase. Must be listed under
 * Authentication → URL configuration → Redirect URLs.
 *
 * If this URL is missing, Supabase falls back to Site URL (often http://localhost:3000).
 */
export function getAuthRedirectUri(): string {
  const override = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI?.trim();
  if (override) return override;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/auth/callback`;
    }
    return makeRedirectUri({ path: 'auth/callback' });
  }

  const fromExpo = makeRedirectUri({
    scheme: 'studypartner',
    path: 'auth/callback',
    preferLocalhost: false,
  });

  // Never send localhost to Supabase from native — triggers Site URL fallback (localhost:3000).
  if (fromExpo.includes('localhost') || fromExpo.includes('127.0.0.1')) {
    return Linking.createURL('/auth/callback');
  }

  return fromExpo;
}
