import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

async function syncSessionToStore() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  useAuthStore.getState().setSession(data.session);
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

    return () => sub.subscription.unsubscribe();
  }, [setSession, setInitialized]);
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await syncSessionToStore();
}

export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const redirectTo = Linking.createURL('/(auth)/login');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  useAuthStore.getState().reset();
}
