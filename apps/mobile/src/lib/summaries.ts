import { supabase } from './supabase';
import { buildLocalSummary, normalizeSummaryContent } from './summaryContent';

export { normalizeSummaryContent, buildLocalSummary } from './summaryContent';

/** Generate and store a summary from note text (on-device, no external AI). */
export async function generateSummary(
  noteId: string,
  regenerate = false
): Promise<{ summary: unknown }> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  if (!regenerate) {
    const { data: existing } = await supabase
      .from('summaries')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return { summary: existing };
  }

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id, title, content_text')
    .eq('id', noteId)
    .is('deleted_at', null)
    .single();

  if (noteError || !note) throw new Error('Note not found');

  const content = buildLocalSummary(note);

  const { data: summary, error: insertError } = await supabase
    .from('summaries')
    .insert({
      note_id: noteId,
      content_json: content,
      model: 'local',
      token_count: note.content_text?.length ?? 0,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return { summary };
}

export async function fetchSummaryContent(noteId: string) {
  const { data: row, error } = await supabase
    .from('summaries')
    .select('content_json')
    .eq('note_id', noteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;
  return normalizeSummaryContent(row.content_json);
}
