# Connecting Supabase to StudyPartner

StudyPartner is an **Expo (React Native)** app. Supabase dashboard templates for **Next.js**, **Create React App**, and **shadcn/React Router** do **not** apply directly.

See [supabase-ui-mapping.md](./supabase-ui-mapping.md) for CRA/React dashboard steps → Expo mapping.

## What we use instead of web templates

| Web template | StudyPartner (Expo) |
|--------------|---------------------|
| `@supabase/ssr` | Not needed |
| `@supabase/supabase-client-react-router` (shadcn) | Not needed — skip step 2 |
| `REACT_APP_*` / `NEXT_PUBLIC_*` | `EXPO_PUBLIC_*` in `apps/mobile/.env` |
| Cookie-based sessions | `expo-secure-store` via `src/lib/supabase.ts` |

## 1. Install (already done)

```bash
cd apps/mobile
npm install @supabase/supabase-js
```

Do **not** install `@supabase/ssr` unless you add a separate Next.js web app.

## 2. Environment variables

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://YOUR_PROJECT.supabase.co/functions/v1
```

Restart Expo after editing: `npm start`.

## 3. Database

Run `supabase/migrations/20260531120000_initial_schema.sql` in the Supabase SQL editor (or `supabase db push`).

## 4. Auth redirects

In **Authentication → URL configuration**, add:

- `studypartner://auth/callback`
- `exp://127.0.0.1:8081` (for Expo Go during development)

## 5. Edge Functions (AI)

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-summary generate-quiz generate-flashcards
supabase secrets set OPENAI_API_KEY=sk-...
```

## Optional: Agent Skills

```bash
npx skills add supabase/agent-skills
```

Helpful for AI assistants in Cursor; not required to run the app.
