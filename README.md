# StudyPartner

AI-powered study companion for students — upload notes and PDFs, get summaries, quizzes, and flashcards, track progress with Pomodoro sessions.

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

## Features

- Email + Google authentication with secure session storage
- Upload PDFs, images, and text notes
- AI-generated structured summaries, quizzes, and flashcards
- Pomodoro focus timer with session logging
- Progress dashboard with streaks and weekly stats
- Dark mode and study reminders

## Architecture

```text
apps/mobile (Expo + React Native)
    ├── Supabase Auth + PostgreSQL (RLS)
    ├── Supabase Storage (user-uploads)
    └── Edge Functions → OpenAI / Gemini
```

See [docs/architecture.md](docs/architecture.md) for details.

## Quick start

### Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) or Android/iOS simulator
- [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
cd StudyPartner/apps/mobile
npm install
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/20260531120000_initial_schema.sql` (SQL Editor or CLI)
3. Enable **Google** provider under Authentication → Providers
4. Add redirect URL: `studypartner://auth/callback`
5. Deploy Edge Functions and set secrets:

```bash
supabase functions deploy generate-summary generate-quiz generate-flashcards
supabase secrets set OPENAI_API_KEY=sk-...
```

### 3. Run the app

```bash
npm start
```

Press `a` for Android or scan QR with Expo Go.

## Project structure

```text
StudyPartner/
├── apps/mobile/          # Expo React Native app
├── supabase/
│   ├── migrations/       # Database schema + RLS
│   └── functions/        # AI Edge Functions
├── docs/                 # Architecture & API docs
└── .github/workflows/    # CI/CD
```

## Testing

```bash
cd apps/mobile
npm test
npm run typecheck
npm run lint
```

## Deployment

- **Backend:** `supabase db push` + `supabase functions deploy`
- **Mobile:** [EAS Build](https://docs.expo.dev/build/introduction/) — see `apps/mobile/eas.json`

```bash
cd apps/mobile
npx eas build --profile preview
```

## Portfolio

- Record a 2–3 min demo: login → upload → summary → quiz → flashcards → progress
- Add screenshots to `store-assets/`
- Link this repo on your CV with bullets on RLS, Edge Functions, and cost-aware AI rate limits

## License

MIT
