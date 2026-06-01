import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { createSessionFromAuthUrl, getAuthRedirectUri } from '../lib/authRedirect';
import { useAuthStore } from '../stores/authStore';

WebBrowser.maybeCompleteAuthSession();

function isAuthCallbackUrl(url: string): boolean {
  return url.includes('auth/callback');
}

export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialized(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });

    const handleDeepLink = async (url: string) => {
      if (!isAuthCallbackUrl(url)) return;
      try {
        const session = await createSessionFromAuthUrl(url);
        if (session) setSession(session);
      } catch {
        // User can retry sign-in from the login screen
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) void handleDeepLink(url);
    });

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      void handleDeepLink(url);
    });

    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, [setSession, setInitialized]);
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

const redirectMismatchHint = (redirectTo: string) =>
  `Add this exact URL under Supabase → Authentication → URL configuration → Redirect URLs:\n${redirectTo}\n\n` +
  `Also change Site URL away from http://localhost:3000 (that URL is only a fallback when the redirect above is missing).`;

export async function signInWithGoogle() {
  const redirectTo = getAuthRedirectUri();

  if (__DEV__) {
    console.log('[StudyPartner] Google OAuth redirectTo:', redirectTo);
  }

  // Web: full-page redirect back to /auth/callback on the same origin (e.g. :8081, not :3000).
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: false },
    });
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) {
    throw new Error(
      'Google sign-in URL was not returned. Enable Google under Supabase → Authentication → Providers.'
    );
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Google sign-in was cancelled');
  }
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in did not complete');
  }

  if (result.url.includes('localhost:3000')) {
    throw new Error(
      `Supabase redirected to localhost:3000 instead of the app.\n\n${redirectMismatchHint(redirectTo)}`
    );
  }

  const session = await createSessionFromAuthUrl(result.url);
  if (!session) {
    throw new Error(`Sign-in callback had no session.\n\n${redirectMismatchHint(redirectTo)}`);
  }
}

export async function resetPassword(email: string) {
  const redirectTo = getAuthRedirectUri();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  useAuthStore.getState().reset();
}
