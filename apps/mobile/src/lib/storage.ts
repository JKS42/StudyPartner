import { File } from 'expo-file-system';
import { EncodingType, getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { resolveMimeType, sanitizeFileName, validateFileUpload } from './validators';
import type { SourceType } from '../types/database';

const UPLOADS_BUCKET = 'user-uploads';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function readFilePayload(
  uri: string
): Promise<{ data: ArrayBuffer; sizeBytes: number }> {
  try {
    const file = new File(uri);
    if (file.exists && file.size > 0) {
      return { data: await file.arrayBuffer(), sizeBytes: file.size };
    }
  } catch {
    // Fall back to legacy API for content:// URIs and older paths.
  }

  const info = await getInfoAsync(uri);
  if (!info.exists) {
    throw new Error('Could not read the selected file. Try again.');
  }

  const sizeBytes = 'size' in info && info.size ? info.size : 0;
  const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
  return { data: base64ToArrayBuffer(base64), sizeBytes };
}

function mimeToSourceType(mime: string): SourceType {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'document';
  }
  return 'text';
}

export async function uploadNoteFile(
  userId: string,
  noteId: string,
  uri: string,
  mimeType: string,
  fileName: string
): Promise<{ storagePath: string; sizeBytes: number; mimeType: string }> {
  const resolvedMime = resolveMimeType(mimeType, fileName);
  const { data, sizeBytes } = await readFilePayload(uri);

  const validationError = validateFileUpload(resolvedMime, sizeBytes);
  if (validationError) throw new Error(validationError);

  const safeName = sanitizeFileName(fileName);
  const storagePath = `${userId}/${noteId}/${safeName}`;

  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(storagePath, data, {
    contentType: resolvedMime,
    upsert: true,
  });

  if (error) throw error;
  return { storagePath, sizeBytes, mimeType: resolvedMime };
}

export { mimeToSourceType };

export async function getSignedFileUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error) return null;
  return data.signedUrl;
}
