# StudyPartner Architecture

## Overview

StudyPartner is a monorepo with an Expo mobile client and Supabase backend. All user data is isolated via PostgreSQL Row Level Security (RLS).

## Mobile (`apps/mobile`)

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 54, React Native 0.81 |
| Navigation | Expo Router (file-based) |
| State | Zustand (UI/timer), TanStack Query (server) |
| Auth storage | expo-secure-store |

### Route structure

- `app/index.tsx` — Splash / session redirect
- `app/(auth)/*` — Login, signup, forgot password
- `app/(tabs)/*` — Dashboard, library, study timer, progress
- `app/upload.tsx` — Material upload modal
- `app/note/[id].tsx` — Note hub (summary, quiz, flashcards, delete)
- `app/summary/[noteId].tsx` — Structured summary view
- `app/quiz/[id].tsx` — Quiz flow + scoring
- `app/flashcards/[deckId].tsx` — Card review
- `app/settings.tsx` — Profile, username, notifications

## Backend (Supabase)

- **Auth:** Email/password
- **Database:** PostgreSQL with RLS on all tables
- **Storage:** Private `user-uploads` bucket (`{user_id}/{note_id}/file`)
- **Edge Functions:** `send-push`, `send-study-reminders` (notifications only)

## Study content pipeline (no external AI)

1. User uploads or pastes note text (`notes.content_text`)
2. PDF/DOCX/plain files are parsed on-device when possible (`extractText.ts`)
3. Mobile builds summary / quiz / flashcards locally (`summaryContent.ts`, `studyContent.ts`)
4. Results are inserted via Supabase client (RLS enforces ownership)
5. Screens read from `summaries`, `quizzes`, `flashcard_decks`, `flashcards`

## Folders & offline

- **Folders:** filter in Library, assign on Upload (`folders` table + `useFolders`)
- **Offline:** text-only notes queue when offline; syncs via NetInfo + `offlineProcessor`

## Security

- File MIME allowlist + 15 MB cap (client validation + storage policy)
- Per-user storage paths enforced by RLS
- Secrets (Supabase keys) in `apps/mobile/.env` only — not committed
