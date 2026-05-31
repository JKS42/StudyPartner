export type SourceType = 'pdf' | 'image' | 'text' | 'voice' | 'document';
export type NoteStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type SessionType = 'pomodoro' | 'quiz' | 'flashcards';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  school: string | null;
  subjects: string[];
  study_goal_minutes: number;
  theme: ThemePreference;
  streak_count: number;
  last_study_date: string | null;
  push_notifications_enabled: boolean;
  local_reminders_enabled: boolean;
  reminder_hour: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  parent_id: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  content_text: string | null;
  source_type: SourceType;
  status: NoteStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteFile {
  id: string;
  note_id: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  checksum: string | null;
}

export interface SummaryContent {
  overview: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  examTips: string[];
}

export interface Summary {
  id: string;
  note_id: string;
  content_json: SummaryContent;
  model: string | null;
  token_count: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  note_id: string;
  title: string;
  questions_json: QuizQuestion[];
  difficulty: string;
  created_at: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  note_id: string | null;
  title: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  ease_factor: number;
  next_review_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  note_id: string | null;
  deck_id: string | null;
  type: SessionType;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
}
