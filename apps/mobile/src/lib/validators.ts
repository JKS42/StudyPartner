import { z } from 'zod';

export const summaryContentSchema = z.object({
  overview: z.string(),
  keyPoints: z.array(z.string()),
  definitions: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    })
  ),
  examTips: z.array(z.string()),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
});

export const quizQuestionsSchema = z.array(quizQuestionSchema).min(1);

export const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  tags: z.array(z.string()).optional(),
});

export const flashcardsSchema = z.array(
  z.object({
    front: z.string(),
    back: z.string(),
  })
).min(1);

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
] as const;

export const DOCUMENT_PICKER_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'com.adobe.pdf',
  'public.plain-text',
  'com.microsoft.word.doc',
  'org.openxmlformats.wordprocessingml.document',
] as const;

const EXTENSION_MIME: Record<string, (typeof ALLOWED_MIME_TYPES)[number]> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const MAX_FILE_BYTES = 15 * 1024 * 1024;

export function resolveMimeType(
  mimeType: string | null | undefined,
  fileName: string
): string {
  const normalized = mimeType?.split(';')[0]?.trim().toLowerCase();
  if (
    normalized &&
    normalized !== 'application/octet-stream' &&
    ALLOWED_MIME_TYPES.includes(normalized as (typeof ALLOWED_MIME_TYPES)[number])
  ) {
    return normalized;
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext && EXTENSION_MIME[ext]) return EXTENSION_MIME[ext];

  return normalized ?? 'application/octet-stream';
}

export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop()?.trim() || 'upload';
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safe.length > 0 ? safe : 'upload';
}

export function validateFileUpload(mimeType: string, sizeBytes: number): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return 'File type not supported. Use PDF, Word (.doc/.docx), JPEG, PNG, or plain text.';
  }
  if (sizeBytes <= 0) {
    return 'Could not read the file size. Try selecting the file again.';
  }
  if (sizeBytes > MAX_FILE_BYTES) {
    return 'File exceeds 15 MB limit.';
  }
  return null;
}
