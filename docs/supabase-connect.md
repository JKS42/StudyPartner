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

## 4. Auth redirects (required for Google sign-in)

In **Authentication → URL configuration → Redirect URLs**, add **every** URL your app may use:

| Environment | Typical redirect URL |
|-------------|----------------------|
| Dev build / production | `studypartner://auth/callback` |
| Expo Go (local) | `exp://127.0.0.1:8081/--/auth/callback` |
| Expo Go (LAN) | `exp://YOUR_LAN_IP:8081/--/auth/callback` |

To see the exact URL your device uses, temporarily log it from the app:

```ts
import { getAuthRedirectUri } from './src/lib/authRedirect';
console.log(getAuthRedirectUri());
```

Mismatch between this URL and Supabase’s allow list is the most common cause of Google sign-in failing silently.

### Fix: redirected to `http://localhost:3000` after Google

That page is **not** your app. Supabase sends users there when the app’s `redirectTo` URL is **not** on the allow list, and it falls back to **Site URL** (default `http://localhost:3000`).

1. In the Metro/Expo terminal, tap Google sign-in and note the log line:  
   `[StudyPartner] Google OAuth redirectTo: …`
2. Copy that **exact** URL into **Redirect URLs**.
3. Under **Site URL**, replace `http://localhost:3000` with:
   - `studypartner://auth/callback` for mobile-only testing, or
   - `http://localhost:8081` if you use Expo web (`w` in the terminal).

Optional override in `apps/mobile/.env`:

```env
EXPO_PUBLIC_AUTH_REDIRECT_URI=exp://192.168.1.10:8081/--/auth/callback
```

### Google provider

1. **Authentication → Providers → Google** — enable and add OAuth **Client ID** and **Client secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth client of type **Web application** (used by Supabase, not the mobile app directly).
3. Under **Authorized redirect URIs** in Google Cloud, add your Supabase callback:  
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Copy the same client ID/secret into the Supabase Google provider settings.

## 5. Edge Functions (notifications)

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-push send-study-reminders
supabase secrets set CRON_SECRET=your-random-secret
```

Summaries, quizzes, and flashcards are generated **on the device** — no AI Edge Functions required.

## Optional: Agent Skills

```bash
npx skills add supabase/agent-skills
```

Helpful for AI assistants in Cursor; not required to run the app.
