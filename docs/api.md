# StudyPartner API

## Edge Functions

### POST `/functions/v1/send-push`

Requires `Authorization: Bearer <supabase_jwt>`.

Send a push notification to the authenticated user's registered devices.

```json
{ "title": "StudyPartner", "body": "Time to review!", "data": { "url": "/(tabs)/study" } }
```

### POST `/functions/v1/send-study-reminders`

Cron endpoint — sends streak reminders to users who opted in and have not studied today.  
Requires header: `Authorization: Bearer <CRON_SECRET>` (set in Supabase secrets).

Schedule via Supabase Dashboard → Integrations → Cron, or pg_cron daily at 18:00.

## Mobile study generation

Summaries, quizzes, and flashcards are **not** Edge Functions. They are created in the app:

| Feature | Module | Storage |
|---------|--------|---------|
| Summary | `src/lib/summaries.ts` | `summaries.content_json` |
| Quiz | `src/lib/studyTools.ts` | `quizzes.questions_json` |
| Flashcards | `src/lib/studyTools.ts` | `flashcard_decks` + `flashcards` |

## Database tables

See `supabase/migrations/` for full schema: `profiles`, `folders`, `notes`, `files`, `summaries`, `quizzes`, `quiz_attempts`, `flashcard_decks`, `flashcards`, `study_sessions`, `progress_events`, `push_tokens`.
