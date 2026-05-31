import { supabase } from './supabase';

const UPLOADS_BUCKET = 'user-uploads';

/** Soft-delete a note and remove any uploaded files from storage. */
export async function deleteMaterial(noteId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id, user_id, deleted_at, files(storage_path)')
    .eq('id', noteId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (noteError) throw noteError;
  if (!note) throw new Error('Material not found');
  if (note.deleted_at) return;

  const files = (note.files ?? []) as { storage_path: string }[];
  const storagePaths = files.map((f) => f.storage_path).filter(Boolean);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .remove(storagePaths);

    if (storageError) throw storageError;
  }

  const { error: deleteError } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userData.user.id);

  if (deleteError) throw deleteError;
}
