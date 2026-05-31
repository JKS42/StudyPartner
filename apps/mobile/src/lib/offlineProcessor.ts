import { saveNoteWithOptionalFile, type SaveNoteInput } from './uploadNote';
import type { OfflineMutation } from '../stores/offlineStore';
import type { SourceType } from '../types/database';

export async function processOfflineMutation(mutation: OfflineMutation): Promise<void> {
  switch (mutation.type) {
    case 'note_create': {
      const payload = mutation.payload as {
        title: string;
        content_text?: string;
        source_type: SourceType;
        folder_id?: string | null;
        tags?: string[];
      };
      await saveNoteWithOptionalFile({
        title: payload.title,
        content_text: payload.content_text,
        source_type: payload.source_type,
        folder_id: payload.folder_id,
        tags: payload.tags,
      });
      break;
    }
    default:
      break;
  }
}

export type { SaveNoteInput };
