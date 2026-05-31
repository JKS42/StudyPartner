# StudyPartner Architecture

## Overview

StudyPartner is a monorepo with an Expo mobile client and Supabase backend. All user data is isolated via PostgreSQL Row Level Security (RLS).

## Mobile (`apps/mobile`)

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 56, React Native |
| Navigation | Expo Router (file-based) |
| State | Zustand (UI/timer), TanStack Query (server) |
| Auth storage | expo-secure-store |

### Route structure

- `app/index.tsx` — Splash / session redirect
- `app/(auth)/*` — Login, signup, forgot password
- `app/(tabs)/*` — Dashboard, library, study timer, progress
- `app/upload.tsx` — Material upload modal
- `app/note/[id].tsx` — Note hub (AI actions)
- `app/summary/[noteId].tsx` — Structured summary view
- `app/quiz/[id].tsx` — Quiz flow + scoring
- `app/flashcards/[deckId].tsx` — Card review
- `app/settings.tsx` — Profile and preferences

## Backend (Supabase)

- **Auth:** Email/password + Google OAuth
- **Database:** PostgreSQL with RLS on all tables
- **Storage:** Private `user-uploads` bucket (`{user_id}/{note_id}/file`)
- **Edge Functions:** Deno — `generate-summary`, `generate-quiz`, `generate-flashcards`

## AI pipeline

1. Mobile sends JWT to Edge Function
2. Function verifies user, checks `ai_usage` daily limits
3. LLM called server-side (OpenAI or Gemini)
4. JSON validated and stored in `summaries` / `quizzes` / `flashcards`
5. Mock responses used when no API key (local dev)

## Security

- LLM keys only in Supabase secrets
- File MIME allowlist + 15 MB cap (client + storage policy)
- Per-user storage paths enforced by RLS
