import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Folder } from '../types/database';

const FOLDERS_KEY = ['folders'] as const;

export function useFolders() {
  return useQuery({
    queryKey: FOLDERS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Folder[];
    },
  });
}

export function useCreateFolder() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const name = input.name.trim();
      if (!name) throw new Error('Folder name is required');

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: userData.user.id,
          name,
          color: input.color ?? '#6366f1',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Folder;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: FOLDERS_KEY }),
  });
}
