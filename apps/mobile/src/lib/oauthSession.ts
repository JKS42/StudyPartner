import type { Session } from '@supabase/supabase-js';
import { createSessionFromAuthUrl } from './authRedirect';
import { supabase } from './supabase';
import { useAuthStore } from '../stores/authStore';

let exchangeInFlight: Promise<Session | null> | null = null;

/** Exchange OAuth callback URL for a session and sync the auth store (deduped). */
export async function completeOAuthFromUrl(url: string): Promise<Session | null> {
  if (exchangeInFlight) return exchangeInFlight;

  exchangeInFlight = (async () => {
    const session = await createSessionFromAuthUrl(url);
    if (session) {
      useAuthStore.getState().setSession(session);
      return session;
    }
    return null;
  })().finally(() => {
    exchangeInFlight = null;
  });

  return exchangeInFlight;
}

/** After the browser closes, session may already be in Supabase storage via deep link. */
export async function syncSessionFromStorage(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) {
    useAuthStore.getState().setSession(data.session);
  }
  return data.session;
}
