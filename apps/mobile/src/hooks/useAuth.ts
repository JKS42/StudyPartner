import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
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

export async function signInWithGoogle() {
  const redirectTo = getAuthRedirectUri();

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

  const session = await createSessionFromAuthUrl(result.url);
  if (!session) {
    throw new Error(
      `Sign-in callback had no session. In Supabase → Authentication → URL configuration, add this redirect URL:\n${redirectTo}`
    );
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
