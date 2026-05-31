# StudyPartner Development Roadmap

This document mirrors the project plan for contributors. Phases map to git milestones.

## Phase 1 — Setup & auth ✅

- Expo + Supabase init
- Email / Google auth, profiles, navigation shell
- CI lint + typecheck

## Phase 2 — Upload & storage ✅

- Storage bucket + RLS
- Upload UI, notes/files tables
- Library list with search

## Phase 3 — AI summaries ✅

- `generate-summary` Edge Function
- Summary screen + regenerate
- `ai_usage` rate limits

## Phase 4 — Quiz & flashcards ✅

- `generate-quiz`, `generate-flashcards`
- Quiz UX + flashcard review
- Pomodoro session logging

## Phase 5 — Analytics ✅

- Progress dashboard
- Streaks via `profiles`
- Expo notifications for reminders
- Offline queue scaffold

## Phase 6 — Ship ✅

- Jest unit tests
- EAS config
- GitHub Actions CI
- README + portfolio docs

## Post-MVP ideas

- AI tutor (RAG + pgvector)
- OCR / voice notes
- Group study + full offline sync
