# Due

A small installable web app (PWA) for posting assignment and form deadlines.
Anyone in the batch can submit a link with a deadline; an admin approves it, then
everyone gets a push notification, plus reminders 24h and 2h before it's due.

## Stack

- Next.js (App Router) + Tailwind, deployed on Vercel
- Supabase: Google sign-in, Postgres with row-level security, scheduled reminders
- Web Push for notifications (works on Android, and on iPhone after "Add to Home Screen")

## Running locally

```bash
npm install
npm run dev
```

Regenerate icons after editing `public/icons/icon.svg`:

```bash
node scripts/icons.mjs
```
