import type { Session } from '@supabase/supabase-js';
import { extractAuthParams } from './authParams';
import { supabase } from './supabase';

export { extractAuthParams } from './authParams';
export { getAuthRedirectUri } from './authRedirectUri';

export async function createSessionFromAuthUrl(url: string): Promise<Session | null> {
  const params = extractAuthParams(url);

  if (params.error) {
    throw new Error(params.error_description ?? params.error);
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}
