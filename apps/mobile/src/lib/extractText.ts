import mammoth from 'mammoth';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { readFileBuffer } from './storage';
import { resolveMimeType } from './validators';

export { mergeNoteText } from './noteText';

const MAX_EXTRACT_CHARS = 50_000;

function trimExtracted(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (normalized.length <= MAX_EXTRACT_CHARS) return normalized;
  return `${normalized.slice(0, MAX_EXTRACT_CHARS)}\n\n[Text truncated…]`;
}

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true,
    });
    const pdf = await loadingTask.promise;
    const parts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? String(item.str) : ''))
        .join(' ')
        .trim();
      if (pageText) parts.push(pageText);
    }

    return parts.length > 0 ? trimExtracted(parts.join('\n\n')) : null;
  } catch {
    return null;
  }
}

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value?.trim();
    return text ? trimExtracted(text) : null;
  } catch {
    return null;
  }
}

/** Extract readable text from uploaded files for summaries and study tools. */
export async function extractTextFromFile(
  uri: string,
  mimeType: string,
  fileName: string
): Promise<string | null> {
  const resolved = resolveMimeType(mimeType, fileName);

  if (resolved === 'text/plain') {
    try {
      const text = await readAsStringAsync(uri, { encoding: EncodingType.UTF8 });
      return text.trim() ? trimExtracted(text) : null;
    } catch {
      return null;
    }
  }

  const { data } = await readFileBuffer(uri);

  if (resolved === 'application/pdf') {
    return extractPdfText(data);
  }

  if (
    resolved === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    resolved === 'application/msword'
  ) {
    if (resolved === 'application/msword') {
      return null;
    }
    return extractDocxText(data);
  }

  return null;
}
