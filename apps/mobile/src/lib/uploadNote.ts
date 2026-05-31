import { supabase } from './supabase';
import { uploadNoteFile } from './storage';
import { extractTextFromFile, mergeNoteText } from './extractText';
import type { Note, SourceType } from '../types/database';

export interface SaveNoteInput {
  title: string;
  content_text?: string;
  source_type: SourceType;
  folder_id?: string | null;
  tags?: string[];
  file?: { uri: string; mimeType: string; name: string };
}

export async function saveNoteWithOptionalFile(input: SaveNoteInput): Promise<Note> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  let contentText = input.content_text;

  if (input.file) {
    const extracted = await extractTextFromFile(
      input.file.uri,
      input.file.mimeType,
      input.file.name
    );
    contentText = mergeNoteText(contentText ?? '', extracted);
  }

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert({
      user_id: userData.user.id,
      title: input.title.trim(),
      content_text: contentText ?? null,
      source_type: input.source_type,
      folder_id: input.folder_id ?? null,
      tags: input.tags ?? [],
      status: input.file ? 'uploading' : 'ready',
    })
    .select()
    .single();

  if (noteError || !note) throw noteError ?? new Error('Failed to create note');

  if (input.file) {
    const { storagePath, sizeBytes, mimeType } = await uploadNoteFile(
      userData.user.id,
      note.id,
      input.file.uri,
      input.file.mimeType,
      input.file.name
    );

    const { error: fileError } = await supabase.from('files').insert({
      note_id: note.id,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: sizeBytes,
    });

    if (fileError) throw fileError;

    const { data: updated, error: updateError } = await supabase
      .from('notes')
      .update({ status: 'ready', content_text: contentText ?? null })
      .eq('id', note.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated as Note;
  }

  return note as Note;
}
