# Supabase dashboard → React / CRA template mapping

StudyPartner is **Expo (React Native)**, not Create React App or React Router web. Use this mapping when following [supabase.com/ui](https://supabase.com/ui) install steps.

| Dashboard step (web) | StudyPartner (already done) |
|----------------------|-----------------------------|
| `npm install @supabase/supabase-js` | ✅ `apps/mobile` — see `package.json` |
| `npx shadcn add @supabase/supabase-client-react-router` | ❌ **Skip** — shadcn + React Router is for web apps only |
| `.env.local` with `REACT_APP_SUPABASE_*` | ✅ Use `apps/mobile/.env` with `EXPO_PUBLIC_*` instead |
| Supabase UI auth/storage components | ❌ **Skip for mobile** — we use custom Expo screens in `app/(auth)/` |
| `npx skills add supabase/agent-skills` | Optional — helps Cursor AI with Supabase |

## Your env file (`apps/mobile/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://zxpjmoepzlbjmsttkxah.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://zxpjmoepzlbjmsttkxah.supabase.co/functions/v1
```

**Do not** use `REACT_APP_*` or `.env.local` at the repo root — Expo only reads `EXPO_PUBLIC_*` from `apps/mobile/.env`.

## Supabase client (mobile equivalent)

Web shadcn installs a React Router provider. We use:

- Client: [`apps/mobile/src/lib/supabase.ts`](../apps/mobile/src/lib/supabase.ts)
- Auth hooks: [`apps/mobile/src/hooks/useAuth.ts`](../apps/mobile/src/hooks/useAuth.ts)
- Session storage: `expo-secure-store` (not cookies)

## Restart after env changes

```bash
cd apps/mobile
npm start
```

See also: [supabase-connect.md](./supabase-connect.md)
