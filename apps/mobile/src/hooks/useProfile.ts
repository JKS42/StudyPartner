import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeUsername, validateUsername } from '../lib/profile';
import { supabase } from '../lib/supabase';
import type { Profile, ThemePreference } from '../types/database';
import { useThemeStore } from '../stores/themeStore';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  const setThemePreference = useThemeStore((s) => s.setPreference);

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const payload = { ...updates };
      if ('username' in payload) {
        const raw = payload.username ?? '';
        if (!raw || !raw.trim()) {
          payload.username = null;
        } else {
          const normalized = normalizeUsername(raw);
          const error = validateUsername(normalized);
          if (error) throw new Error(error);
          payload.username = normalized;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userData.user.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('That username is already taken. Try another.');
        }
        throw error;
      }
      if (updates.theme) {
        setThemePreference(updates.theme as ThemePreference);
      }
      return data as Profile;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['profile'] }),
  });
}
