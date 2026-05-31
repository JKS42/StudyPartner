export function mergeNoteText(manual: string, extracted: string | null | undefined): string | undefined {
  const parts = [manual.trim(), extracted?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join('\n\n') : undefined;
}
