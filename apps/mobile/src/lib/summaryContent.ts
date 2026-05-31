import { summaryContentSchema } from './validators';
import type { SummaryContent } from '../types/database';

/** Coerce stored JSON into the summary shape the app expects. */
export function normalizeSummaryContent(raw: unknown): SummaryContent | null {
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;
  const overview = obj.overview ?? obj.summary ?? obj.introduction;
  const keyPointsRaw = obj.keyPoints ?? obj.key_points ?? obj.points;
  const definitionsRaw = obj.definitions ?? obj.terms;
  const examTipsRaw = obj.examTips ?? obj.exam_tips ?? obj.tips;

  const keyPoints = Array.isArray(keyPointsRaw)
    ? keyPointsRaw.map(String).filter(Boolean)
    : typeof keyPointsRaw === 'string'
      ? [keyPointsRaw]
      : [];

  const definitions = Array.isArray(definitionsRaw)
    ? definitionsRaw
        .map((d) => {
          if (!d || typeof d !== 'object') return null;
          const row = d as Record<string, unknown>;
          const term = row.term ?? row.name ?? row.title;
          const definition = row.definition ?? row.meaning ?? row.description;
          if (!term || !definition) return null;
          return { term: String(term), definition: String(definition) };
        })
        .filter((d): d is { term: string; definition: string } => d !== null)
    : [];

  const examTips = Array.isArray(examTipsRaw)
    ? examTipsRaw.map(String).filter(Boolean)
    : typeof examTipsRaw === 'string'
      ? [examTipsRaw]
      : [];

  const candidate = {
    overview: overview ? String(overview) : '',
    keyPoints,
    definitions,
    examTips,
  };

  const parsed = summaryContentSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function buildLocalSummary(note: {
  title: string;
  content_text: string | null;
}): SummaryContent {
  const text = note.content_text?.trim();

  if (!text) {
    return {
      overview: `"${note.title}" was uploaded as a file. Add text in the optional notes field when uploading so summaries can be generated.`,
      keyPoints: [
        'File-only uploads do not include extracted text yet.',
        'Open the note and paste key content, or re-upload with notes filled in.',
      ],
      definitions: [],
      examTips: ['Paste the main concepts into the notes field, then regenerate the summary.'],
    };
  }

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const keyPoints =
    sentences.length > 0
      ? sentences.slice(0, 6).map((s) => (s.length > 140 ? `${s.slice(0, 137)}...` : s))
      : [text.slice(0, 140)];

  const overviewFromSentences = sentences.slice(0, 2).join('. ');
  const overview = overviewFromSentences
    ? `${overviewFromSentences}.`
    : `Summary of "${note.title}".`;

  return {
    overview,
    keyPoints,
    definitions: [],
    examTips: ['Review these points with active recall', 'Generate a quiz from this note next'],
  };
}
