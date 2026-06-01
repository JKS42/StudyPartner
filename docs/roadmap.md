# StudyPartner Development Roadmap

This document mirrors the project plan for contributors. Phases map to git milestones.

## Phase 1 — Setup & auth ✅

- Expo SDK 54 + Supabase init
- Email auth, profiles, navigation shell
- CI lint + typecheck

## Phase 2 — Upload & storage ✅

- Storage bucket + RLS
- Upload UI (PDF, Word, images, text)
- Notes/files tables, library list with search
- Delete material (soft-delete + storage cleanup)

## Phase 3 — Study tools (on-device) ✅

- Summaries built from note text (`src/lib/summaries.ts`)
- Quizzes and flashcards from note content (`src/lib/studyContent.ts`)
- Summary / quiz / flashcard screens
- No external AI — generation runs on the client and saves to Supabase

## Phase 4 — Quiz & flashcards UX ✅

- Multiple-choice quiz flow + scoring
- Flashcard review + progress events
- Pomodoro session logging

## Phase 5 — Analytics & profile ✅

- Progress dashboard, streaks
- Usernames in settings + dashboard greeting
- Expo notifications (local reminders + optional remote push)
- Offline queue scaffold (`useOfflineSync`)

## Phase 6 — Ship ✅

- Jest unit tests
- EAS config, app icons (`npm run generate:icons`)
- GitHub Actions CI
- Repo on GitHub: [JKS42/StudyPartner](https://github.com/JKS42/StudyPartner)

---

## Gaps / polish (recommended next)

| Item | Status | Notes |
|------|--------|--------|
| Drop unused `ai_usage` table | Done | Migration `20260531160000_drop_ai_usage.sql` |
| Folders UI | Done | Filter chips + create folder in Library; picker on Upload |
| PDF/Word text extraction | Done | `extractText.ts` — PDF via pdfjs, DOCX via mammoth |
| Offline sync | Done | NetInfo + queue for text-only note creates |

## Post-MVP ideas

- Folder organization + tags UI
- PDF/DOCX text extraction (server or on-device)
- Full offline sync for uploads
- Spaced repetition for flashcards
- Group study / shared decks
- Optional cloud OCR for scanned notes
