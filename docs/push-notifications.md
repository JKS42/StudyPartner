# Push notifications

StudyPartner supports **local reminders** (on-device) and **remote push** (via Expo Push Service).

## Setup

### 1. Database migration

Run in Supabase SQL editor:

`supabase/migrations/20260531130000_push_notifications.sql`

Creates `push_tokens` table and profile notification flags.

### 2. EAS project ID (required for remote push)

Remote push tokens need a real Expo project UUID. The placeholder value causes a 400 error.

```bash
cd apps/mobile
npx eas login          # if not already signed in
npx eas init           # links the app and writes extra.eas.projectId into app.json
```

Restart Expo after `eas init` (`npm start`). Until this is done, **local reminders** still work; only server-sent push is skipped.

### 3. Deploy Edge Functions

```bash
supabase functions deploy send-push send-study-reminders
supabase secrets set CRON_SECRET=your-random-secret
```

### 4. Schedule daily streak reminders (optional)

In Supabase, create a cron job that POSTs to:

`https://YOUR_PROJECT.supabase.co/functions/v1/send-study-reminders`

Header: `Authorization: Bearer YOUR_CRON_SECRET`

## In the app

- Push tokens register automatically after sign-in (`usePushNotifications`).
- **Settings → Enable push notifications** — manual opt-in + permission prompt.
- **Send test push** — calls `send-push` Edge Function.
- **Daily local reminder** — schedules an on-device notification at 6 PM (no server needed).
- Tapping a notification with `data.url` deep-links into the app (e.g. Study tab).

## Limitations

- **Expo Go**: push is limited; use an **EAS development build** for reliable remote push.
- **Physical device** required for token registration (not simulators).
- iOS requires Apple Push credentials configured in EAS for production builds.
