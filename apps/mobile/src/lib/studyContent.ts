import { quizQuestionsSchema } from './validators';
import type { Flashcard, QuizQuestion } from '../types/database';

function normalizeQuestion(raw: unknown): QuizQuestion | null {
  if (!raw || typeof raw !== 'object') return null;

  const q = raw as Record<string, unknown>;
  const question = q.question ?? q.prompt ?? q.text;
  const optionsRaw = q.options ?? q.choices ?? q.answers;
  const correctRaw = q.correctIndex ?? q.correct_index ?? q.answer ?? 0;
  const explanation = q.explanation ?? q.reason ?? 'Review your notes.';

  if (!question) return null;

  const options = Array.isArray(optionsRaw)
    ? optionsRaw.map(String).filter(Boolean)
    : [];
  if (options.length < 2) return null;

  let correctIndex = 0;
  if (typeof correctRaw === 'number') {
    correctIndex = correctRaw;
  } else if (typeof correctRaw === 'string') {
    const letter = correctRaw.trim().toUpperCase();
    if (/^[A-D]$/.test(letter)) {
      correctIndex = letter.charCodeAt(0) - 65;
    } else {
      correctIndex = Number(correctRaw);
    }
  }

  if (!Number.isFinite(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    correctIndex = 0;
  }

  return {
    question: String(question),
    options,
    correctIndex,
    explanation: String(explanation),
  };
}

export function normalizeQuizQuestions(raw: unknown): QuizQuestion[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).questions ??
        (raw as Record<string, unknown>).items ??
        [])
      : [];

  const questions = (Array.isArray(list) ? list : [])
    .map(normalizeQuestion)
    .filter((q): q is QuizQuestion => q !== null);

  const parsed = quizQuestionsSchema.safeParse(questions);
  return parsed.success ? parsed.data : questions.length > 0 ? questions : [];
}

export function normalizeFlashcards(
  raw: unknown
): Pick<Flashcard, 'front' | 'back'>[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).cards ??
        (raw as Record<string, unknown>).flashcards ??
        [])
      : [];

  return (Array.isArray(list) ? list : [])
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const front = row.front ?? row.question ?? row.term;
      const back = row.back ?? row.answer ?? row.definition;
      if (!front || !back) return null;
      return { front: String(front), back: String(back) };
    })
    .filter((c): c is Pick<Flashcard, 'front' | 'back'> => c !== null);
}

function splitNoteChunks(text: string, max: number): string[] {
  const lines = text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const fromLines = lines.filter((line) => /^[-*•]\s+/.test(line) || line.includes(':'));
  if (fromLines.length >= 2) {
    return fromLines.slice(0, max).map((line) => line.replace(/^[-*•]\s+/, ''));
  }

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (sentences.length > 0) return sentences.slice(0, max);
  return [text.slice(0, 240)];
}

function splitTermDefinition(line: string): { front: string; back: string } | null {
  const colon = line.match(/^(.{2,80}?)\s*[:–—-]\s*(.+)$/);
  if (colon) {
    return { front: colon[1].trim(), back: colon[2].trim() };
  }
  return null;
}

export function buildLocalQuizQuestions(
  note: { title: string; content_text: string | null },
  questionCount = 8
): QuizQuestion[] {
  const text = note.content_text?.trim();

  if (!text) {
    return [
      {
        question: `What helps generate better quiz questions for "${note.title}"?`,
        options: [
          'Add study text in the notes field when uploading',
          'Upload without a title',
          'Skip reading the material',
          'Use only image files with no context',
        ],
        correctIndex: 0,
        explanation: 'Paste key content into the notes field so quizzes can be built from it.',
      },
    ];
  }

  const chunks = splitNoteChunks(text, questionCount);

  return chunks.map((chunk, i) => {
    const preview = chunk.length > 90 ? `${chunk.slice(0, 87)}...` : chunk;
    return {
      question: `Which option matches point ${i + 1} from your notes?`,
      options: [
        preview,
        'This topic was not in the uploaded material',
        'The opposite of what your notes describe',
        'An unrelated concept from another subject',
      ],
      correctIndex: 0,
      explanation: 'This answer comes directly from your note content.',
    };
  });
}

export function buildLocalFlashcards(
  note: { title: string; content_text: string | null },
  cardCount = 12
): Pick<Flashcard, 'front' | 'back'>[] {
  const text = note.content_text?.trim();

  if (!text) {
    return [
      {
        front: `How can you study "${note.title}" with flashcards?`,
        back: 'Add text in the notes field when uploading, then regenerate flashcards.',
      },
    ];
  }

  const chunks = splitNoteChunks(text, cardCount);

  return chunks.map((chunk, i) => {
    const pair = splitTermDefinition(chunk);
    if (pair) return pair;
    return {
      front: `${note.title} — point ${i + 1}`,
      back: chunk.length > 220 ? `${chunk.slice(0, 217)}...` : chunk,
    };
  });
}
