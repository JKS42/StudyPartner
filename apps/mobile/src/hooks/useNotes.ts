import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMaterial } from '../lib/materials';
import { supabase } from '../lib/supabase';
import type { Note } from '../types/database';

const NOTES_KEY = ['notes'] as const;

export function useNotes(search = '') {
  return useQuery({
    queryKey: [...NOTES_KEY, search],
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: ['note', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, files(*)')
        .eq('id', id!)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      content_text?: string;
      source_type: Note['source_type'];
      folder_id?: string | null;
      tags?: string[];
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userData.user.id,
          title: input.title,
          content_text: input.content_text ?? null,
          source_type: input.source_type,
          folder_id: input.folder_id ?? null,
          tags: input.tags ?? [],
          status: 'ready',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}

export function useDeleteNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: (_data, noteId) => {
      client.invalidateQueries({ queryKey: NOTES_KEY });
      client.invalidateQueries({ queryKey: ['note', noteId] });
      client.removeQueries({ queryKey: ['note', noteId] });
    },
  });
}
