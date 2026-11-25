# Setting up Due

Everything here is on free tiers. Do the steps in order; each one needs a value from the one before.

## 1. Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick the **Mumbai (ap-south-1)** region. Save the database password somewhere.
2. Open **SQL Editor** → **New query**, paste all of `supabase/migrations/20261125000001_schema.sql`, and **Run**.
3. New query again, paste `supabase/migrations/20261125000002_jobs.sql`, **Run**.
4. **Project Settings → API Keys** (or **Data API**): copy the **Project URL**, the **anon / publishable** key and the **service_role / secret** key into `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

   The service-role key bypasses all access rules. Never paste it anywhere public.

## 2. Google sign-in

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project called **Due**.
2. **Google Auth Platform → Get started**. App name `Due`, your email as support email, audience **External**.
3. **Clients → Create client → Web application**.
   - **Authorized redirect URI:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
     (the ref is the `xxxx` in your Supabase URL).
4. Copy the **Client ID** and **Client secret**.
5. **Audience → Publish app**, so anyone (not just listed test users) can sign in. Due only asks for name and email, so Google doesn't need to review it.
6. Back in Supabase: **Authentication → Sign In / Providers → Google**. Enable it, then paste the client ID and secret.

## 3. Block other batches at sign-up

Supabase: **Authentication → Hooks → Add hook → Before User Created** → type **Postgres** →
schema `public`, function `hook_before_user_created`.

(The database also refuses them without this, but the hook shows a readable error instead of a generic one.)

## 4. Try it locally

```bash
npm install
npm run dev
```

In Supabase **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` to **Redirect URLs**.
Open http://localhost:3000 and sign in with your college account. Your profile becomes admin automatically.

## 5. Deploy to Vercel

1. [vercel.com/new](https://vercel.com/new) → import `alienxviking/due`.
2. Add every variable from `.env.local` as an Environment Variable. Set `VAPID_SUBJECT` to your app URL, e.g. `https://due-xyz.vercel.app`.
3. Deploy.
4. Supabase **Authentication → URL Configuration**:
   - **Site URL:** `https://due-sst.vercel.app`
   - **Redirect URLs:** add `https://due-sst.vercel.app/auth/callback`
5. Supabase **SQL Editor**: point the notification jobs at the app (use the same `DISPATCH_SECRET` as Vercel):

   ```sql
   insert into private.config (key, value) values
     ('dispatch_url', 'https://due-sst.vercel.app/api/dispatch'),
     ('dispatch_secret', '<DISPATCH_SECRET>')
   on conflict (key) do update set value = excluded.value;
   ```

## Later: opening Due up

```sql
-- let another batch sign in
insert into private.allowed_batches (batch) values ('25bcs');

-- make someone an admin (they must have signed in once)
update public.profiles set role = 'admin' where email = 'name.25bcsNNNNN@sst.scaler.com';
-- or pre-approve an admin before they sign in
insert into private.admin_emails (email) values ('name.25bcsNNNNN@sst.scaler.com');
```

Each batch only sees its own batch's posts.

## Checking on notifications

```sql
select * from private.outbox order by id desc limit 20;   -- queued / sent events
select * from net._http_response order by id desc limit 10; -- responses from /api/dispatch
select * from cron.job_run_details order by start_time desc limit 10;
```
