# Strong

A workout tracking app with an Expo (React Native) mobile app, a Hono backend, and Supabase for auth and database.

```
strong/
├── supabase/     # Local Supabase config (auth + Postgres)
├── backend/      # Hono API server
└── mobile-app/   # Expo mobile app
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker](https://www.docker.com/) (required by the Supabase CLI)
- [Expo](https://docs.expo.dev/) tooling (installed via `npx`)

## 1. Run Supabase locally

From the project root, start the local Supabase stack:

```bash
supabase start
```

This spins up Postgres and the auth API. Once running:

- API: `http://127.0.0.1:54321`
- Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: `http://127.0.0.1:54323`

To stop it later:

```bash
supabase stop
```

## 2. Run the backend

The backend reads its config from `backend/.env` (Supabase URL, service role key, and `DATABASE_URL`).

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:3000`.

> Database schema is managed with Drizzle (`src/db/schema.ts`). Run migrations with `npm run migrate` if needed.

## 3. Run the mobile app

The app reads its config from `mobile-app/.env` (`EXPO_PUBLIC_*` variables, including the API URL and Supabase keys).

```bash
cd mobile-app
npm install
npm start
```

From the Expo CLI you can then open the app on:

- an iOS simulator (`i`)
- an Android emulator (`a`)
- your device via the Expo Go app / a development build

Make sure Supabase and the backend are running first so the app can reach them.
