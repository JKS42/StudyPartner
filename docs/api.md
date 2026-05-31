# StudyPartner API

## Edge Functions

All functions require `Authorization: Bearer <supabase_jwt>`.

### POST `/functions/v1/generate-summary`

```json
{ "noteId": "uuid", "regenerate": false }
```

**Response:** `{ "summary": { "id", "note_id", "content_json", ... } }`

### POST `/functions/v1/generate-quiz`

```json
{ "noteId": "uuid", "questionCount": 8 }
```

**Response:** `{ "quiz": { "id", "questions_json", ... } }`

### POST `/functions/v1/generate-flashcards`

```json
{ "noteId": "uuid", "cardCount": 12 }
```

**Response:** `{ "deck": { "id", ... }, "cardCount": 12 }`

### POST `/functions/v1/send-push`

Send a push notification to the authenticated user's registered devices.

```json
{ "title": "StudyPartner", "body": "Time to review!", "data": { "url": "/(tabs)/study" } }
```

### POST `/functions/v1/send-study-reminders`

Cron endpoint — sends streak reminders to users who opted in and have not studied today.  
Requires header: `Authorization: Bearer <CRON_SECRET>` (set in Supabase secrets).

Schedule via Supabase Dashboard → Integrations → Cron, or pg_cron daily at 18:00.


| Type | Limit |
|------|-------|
| Summaries | 20 |
| Quizzes | 15 |
| Flashcards | 15 |

Returns `429` when exceeded.

## Database tables

See `supabase/migrations/20260531120000_initial_schema.sql` for full schema: `profiles`, `folders`, `notes`, `files`, `summaries`, `quizzes`, `quiz_attempts`, `flashcard_decks`, `flashcards`, `study_sessions`, `progress_events`, `ai_usage`.
