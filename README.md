# TrueRoute Account System

This folder adds a real Vercel account backend for the standalone `trueroute_nav.html` app.

## What It Adds

- `POST /api/auth/register` creates an account.
- `POST /api/auth/login` signs in.
- `POST /api/auth/logout` signs out.
- `GET /api/auth/me` returns the signed-in user and stats.
- `POST /api/stats/route` records generated route stats.
- `POST /api/stats/navigation` records navigation sessions and travelled distance.
- `POST /api/stats/reroute` records accepted reroutes.
- `POST /api/stats/reset` resets profile stats.

Sessions use an HttpOnly cookie named `trueroute_session`. Passwords are hashed with `bcryptjs`.

## 1. Put Your Site In This Folder

Copy your page into this project as either:

```text
trueroute-vercel-account-system/index.html
```

or:

```text
trueroute-vercel-account-system/trueroute_nav.html
```

Vercel will serve static HTML files from the project root and API files from `/api`.

## 2. Create A Postgres Database

In Vercel:

1. Open your project.
2. Go to Storage.
3. Add a Postgres database from the Vercel Marketplace.
4. Connect it to this project.

Vercel will add the database environment variables automatically.

## 3. Run The Schema

Open the database SQL console and run:

```sql
-- paste db/schema.sql here
```

That creates:

- `users`
- `profile_stats`

## 4. Add JWT_SECRET

In Vercel project settings, add an environment variable:

```text
JWT_SECRET=use-a-long-random-secret-here
```

Generate one locally with:

```bash
openssl rand -base64 48
```

or use any password manager to generate a long random value.

## 5. Install And Deploy

```bash
cd trueroute-vercel-account-system
npm install
npm run deploy
```

For local testing:

```bash
npm run dev
```

Local testing also needs database environment variables. The easiest path is:

```bash
vercel env pull .env.local
```

## 6. How The Frontend Connects

Your HTML now calls relative API paths:

```js
/api/auth/register
/api/auth/login
/api/auth/me
/api/stats/route
/api/stats/navigation
```

That means no hard-coded domain is needed when the HTML and API routes are deployed in the same Vercel project.

## 7. Important Notes

- Do not store passwords in `localStorage`.
- Do not put `JWT_SECRET` in frontend JavaScript.
- Navigation distance is batched before syncing so GPS updates do not create a database write every second.
- The browser still keeps a local cached copy of stats so the UI feels instant, but the database is the source of truth after sign-in.
