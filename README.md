# StudyPartner

A cross-platform study companion that helps students organize materials, generate study aids from their own notes, and stay focused with structured sessions.

Built with **Expo (React Native)** and **Supabase**, StudyPartner keeps authentication, data storage, and access control on a managed backend while running summaries, quizzes, and flashcards entirely on the device—no third-party AI services required.

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

## Overview

StudyPartner is designed for students who want a single place to collect lecture notes, PDFs, and documents, then turn that content into actionable study material. Uploads are stored securely per user; study tools are derived from extracted note text and processed locally on the phone or tablet.

## Features

| Category | Capabilities |
|----------|--------------|
| **Authentication** | Email/password and Google sign-in with secure session storage |
| **Materials** | Upload PDFs, Word documents (`.docx`), images, and plain text; organize with folders |
| **Study tools** | On-device summaries, quizzes, and flashcards generated from your note content |
| **Focus** | Pomodoro timer with session logging |
| **Progress** | Dashboard with streaks and weekly activity |
| **Experience** | Usernames, dark mode, optional push reminders, offline queue for text notes |

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Mobile | Expo SDK 54, React Native, Expo Router, TanStack Query, Zustand |
| Backend | Supabase Auth, PostgreSQL (RLS), Storage |
| Serverless | Supabase Edge Functions (`send-push`, `send-study-reminders`) |
| Tooling | TypeScript, Jest, ESLint, GitHub Actions |

## Architecture

```text
apps/mobile (Expo + React Native)
    ├── Supabase Auth + PostgreSQL (row-level security)
    ├── Supabase Storage (private user-uploads bucket)
    └── Edge Functions (push notifications)
```

For a deeper breakdown, see [docs/architecture.md](docs/architecture.md).

## Getting started

### Prerequisites

- **Node.js** 20 or later
- **Expo Go** or an Android/iOS simulator/emulator
- A **Supabase** project ([supabase.com](https://supabase.com))

### Installation

```bash
git clone https://github.com/JKS42/StudyPartner.git
cd StudyPartner/apps/mobile
npm install
cp .env.example .env
```

Edit `.env` with your Supabase project URL and publishable (anon) key.

### Supabase configuration

1. Create a new project in the Supabase dashboard.
2. Apply migrations from `supabase/migrations/` via the SQL Editor or `supabase db push`.
3. Under **Authentication → Providers**, enable **Google** (optional) and add the redirect URL:  
   `studypartner://auth/callback`
4. *(Optional)* Deploy notification Edge Functions:

   ```bash
   supabase functions deploy send-push send-study-reminders
   supabase secrets set CRON_SECRET=<your-random-secret>
   ```

See [docs/supabase-connect.md](docs/supabase-connect.md) for step-by-step connection details, including **Google sign-in** redirect URLs.

### Run the application

```bash
npm start
```

Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## Project structure

```text
StudyPartner/
├── apps/mobile/          # Expo React Native application
├── supabase/
│   ├── migrations/       # Database schema and RLS policies
│   └── functions/        # Push notification Edge Functions
├── docs/                 # Architecture, API reference, roadmap
├── store-assets/         # App store screenshots and metadata
└── .github/workflows/    # CI/CD pipelines
```

## Development

From `apps/mobile`:

```bash
npm test          # Unit tests
npm run typecheck # TypeScript validation
npm run lint      # ESLint
```

## Deployment

| Target | Command / resource |
|--------|-------------------|
| Database & functions | `supabase db push` and `supabase functions deploy send-push send-study-reminders` |
| Mobile builds | [EAS Build](https://docs.expo.dev/build/introduction/) — configuration in `apps/mobile/eas.json` |

```bash
cd apps/mobile
npx eas build --profile preview
```

## Documentation

- [Architecture](docs/architecture.md) — System design and data flow
- [API & schema](docs/api.md) — Tables, storage, and Edge Functions
- [Roadmap](docs/roadmap.md) — Planned improvements
- [Privacy](PRIVACY.md) — Data handling overview

## License

This project is released under the [MIT License](apps/mobile/LICENSE).
