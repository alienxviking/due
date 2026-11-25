-- Due: core schema, access rules and notification outbox.
-- Run this first, then 20261125000002_jobs.sql.

create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------------
-- Who may sign in
-- ---------------------------------------------------------------------------

-- Batches allowed to sign in. Opening Due to another batch = insert a row here.
create table private.allowed_batches (
  batch text primary key,
  created_at timestamptz not null default now()
);
insert into private.allowed_batches (batch) values ('24bcs');

-- Emails that become admins when they first sign in.
create table private.admin_emails (
  email text primary key check (email = lower(email))
);
insert into private.admin_emails (email) values ('snehangshu.24bcs10155@sst.scaler.com');

-- name.24bcs10155@sst.scaler.com -> '24bcs'; anything else -> null
create function private.batch_of(email text) returns text
language sql immutable set search_path = '' as $$
  select (regexp_match(lower(email), '^[a-z0-9._-]+\.([0-9]{2}[a-z]+)[0-9]+@sst\.scaler\.com$'))[1]
$$;

create function private.email_allowed(email text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.allowed_batches b where b.batch = private.batch_of(email)
  )
$$;

-- Supabase Auth "Before User Created" hook: rejects other emails with a readable message.
create function public.hook_before_user_created(event jsonb) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not coalesce(private.email_allowed(event -> 'user' ->> 'email'), false) then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'Due isn''t open to this account yet. Sign in with your @sst.scaler.com college email.'
    ));
  end if;
  return '{}'::jsonb;
end
$$;
revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  batch text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Creates the profile on first sign-in. Also refuses disallowed emails, in case the hook is off.
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not coalesce(private.email_allowed(new.email), false) then
    raise exception 'Due is not open to %', new.email;
  end if;
  insert into public.profiles (id, email, name, batch, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    private.batch_of(new.email),
    case when exists (select 1 from private.admin_emails a where a.email = lower(new.email))
      then 'admin' else 'user' end
  );
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create function private.my_batch() returns text
language sql stable security definer set search_path = '' as $$
  select batch from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;

create policy "read own profile, admins read all" on public.profiles
  for select to authenticated
  using (id = auth.uid() or private.is_admin());

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  url text not null check (url ~* '^https?://\S+$' and char_length(url) <= 2000),
  note text check (char_length(note) <= 500),
  deadline timestamptz,                       -- null = TBA
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text check (char_length(reject_reason) <= 300),
  batch text not null,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles (id) on delete set null,
  reminded_24h_at timestamptz,
  reminded_2h_at timestamptz
);

create index posts_feed_idx on public.posts (batch, status, deadline);
create index posts_author_idx on public.posts (author_id, created_at desc);

-- Marks reminders whose window has already started, so approving a post due in
-- 5 hours doesn't also fire a "due in 24 hours" reminder right after it.
create function private.premark_reminders(p public.posts) returns public.posts
language plpgsql set search_path = '' as $$
begin
  if p.status = 'approved' and p.deadline is not null then
    if p.deadline <= now() + interval '24 hours' then
      p.reminded_24h_at := coalesce(p.reminded_24h_at, now());
    end if;
    if p.deadline <= now() + interval '2 hours' then
      p.reminded_2h_at := coalesce(p.reminded_2h_at, now());
    end if;
  end if;
  return p;
end
$$;

-- Server-side rules for new posts: the client can't pick its author, batch or status.
create function private.posts_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  me public.profiles;
begin
  if auth.uid() is not null then
    select * into me from public.profiles where id = auth.uid();
    if me.id is null then
      raise exception 'no profile';
    end if;
    new.author_id := me.id;
    new.author_name := coalesce(me.name, split_part(me.email, '@', 1));
    new.batch := me.batch;
    if me.role = 'admin' then
      new.status := 'approved';
      new.approved_at := now();
      new.approved_by := me.id;
    else
      new.status := 'pending';
      new.approved_at := null;
      new.approved_by := null;
    end if;
    new.reject_reason := null;
    new.reminded_24h_at := null;
    new.reminded_2h_at := null;
  end if;
  new.title := btrim(new.title);
  new.created_at := now();
  new.updated_at := now();
  return private.premark_reminders(new);
end
$$;

create trigger posts_before_insert
  before insert on public.posts
  for each row execute function private.posts_before_insert();

create function private.posts_before_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Authors (non-admins) may only edit the content of their own pending post.
  if auth.uid() is not null and not private.is_admin() then
    new.status := old.status;
    new.reject_reason := old.reject_reason;
    new.approved_at := old.approved_at;
    new.approved_by := old.approved_by;
    new.reminded_24h_at := old.reminded_24h_at;
    new.reminded_2h_at := old.reminded_2h_at;
  end if;
  new.id := old.id;
  new.batch := old.batch;
  new.author_id := old.author_id;
  new.author_name := old.author_name;
  new.created_at := old.created_at;
  new.title := btrim(new.title);

  if new.status = 'approved' and old.status <> 'approved' then
    new.approved_at := now();
    new.approved_by := coalesce(auth.uid(), new.approved_by);
    new.reject_reason := null;
  end if;

  -- A new deadline gets fresh reminders.
  if new.deadline is distinct from old.deadline then
    new.reminded_24h_at := null;
    new.reminded_2h_at := null;
  end if;

  if row(new.title, new.url, new.note, new.deadline, new.status, new.reject_reason)
     is distinct from row(old.title, old.url, old.note, old.deadline, old.status, old.reject_reason) then
    new.updated_at := now();
  end if;
  return private.premark_reminders(new);
end
$$;

create trigger posts_before_update
  before update on public.posts
  for each row execute function private.posts_before_update();

alter table public.posts enable row level security;

create policy "approved posts of my batch, my own posts, or admin" on public.posts
  for select to authenticated
  using (
    (status = 'approved' and batch = private.my_batch())
    or author_id = auth.uid()
    or private.is_admin()
  );

create policy "signed-in users submit posts" on public.posts
  for insert to authenticated
  with check (author_id = auth.uid());

create policy "admins edit any post" on public.posts
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "authors edit their pending post" on public.posts
  for update to authenticated
  using (author_id = auth.uid() and status = 'pending')
  with check (author_id = auth.uid());

create policy "admins delete any post, authors delete unapproved ones" on public.posts
  for delete to authenticated
  using (private.is_admin() or (author_id = auth.uid() and status <> 'approved'));

-- ---------------------------------------------------------------------------
-- Push subscriptions (one row per device)
-- ---------------------------------------------------------------------------

create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "see own devices" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "remove own devices" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- Saving goes through this function so a shared device moves to whoever signed in last.
create function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end
$$;
revoke execute on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Notification outbox. Triggers write events here; the /api/dispatch route sends them.
-- ---------------------------------------------------------------------------

create table private.outbox (
  id bigint generated always as identity primary key,
  kind text not null check (kind in (
    'submitted', 'approved', 'rejected', 'deadline_set', 'deadline_changed',
    'reminder_24h', 'reminder_2h'
  )),
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  attempts int not null default 0,
  sent_at timestamptz,
  error text
);
create index outbox_unsent_idx on private.outbox (id) where sent_at is null;

create function private.posts_after_write() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into private.outbox (kind, post_id)
    values (case when new.status = 'approved' then 'approved' else 'submitted' end, new.id);
    return null;
  end if;

  if new.status = 'approved' and old.status <> 'approved' then
    insert into private.outbox (kind, post_id) values ('approved', new.id);
  elsif new.status = 'rejected' and old.status <> 'rejected' then
    insert into private.outbox (kind, post_id) values ('rejected', new.id);
  elsif new.status = 'approved' and new.deadline is distinct from old.deadline and new.deadline is not null then
    insert into private.outbox (kind, post_id)
    values (case when old.deadline is null then 'deadline_set' else 'deadline_changed' end, new.id);
  end if;
  return null;
end
$$;

create trigger posts_after_write
  after insert or update on public.posts
  for each row execute function private.posts_after_write();

-- Called every few minutes: queue 24h / 2h reminders that are now due.
create function private.enqueue_reminders() returns int
language plpgsql security definer set search_path = '' as $$
declare
  n2 int;
  n24 int;
begin
  -- 2h first, and it also covers the 24h one so they never both fire together.
  with due as (
    update public.posts
       set reminded_2h_at = now(), reminded_24h_at = coalesce(reminded_24h_at, now())
     where status = 'approved' and reminded_2h_at is null
       and deadline > now() and deadline <= now() + interval '2 hours'
    returning id
  )
  insert into private.outbox (kind, post_id) select 'reminder_2h', id from due;
  get diagnostics n2 = row_count;

  with due as (
    update public.posts
       set reminded_24h_at = now()
     where status = 'approved' and reminded_24h_at is null
       and deadline > now() and deadline <= now() + interval '24 hours'
    returning id
  )
  insert into private.outbox (kind, post_id) select 'reminder_24h', id from due;
  get diagnostics n24 = row_count;

  return n2 + n24;
end
$$;

-- The dispatcher (service role only) claims a batch of unsent events...
create function public.claim_outbox(max_rows int default 50)
returns table (id bigint, kind text, post_id uuid)
language sql security definer set search_path = '' as $$
  update private.outbox o
     set claimed_at = now(), attempts = o.attempts + 1
   where o.id in (
     select x.id from private.outbox x
      where x.sent_at is null and x.attempts < 5
        and (x.claimed_at is null or x.claimed_at < now() - interval '2 minutes')
      order by x.id
      limit max_rows
      for update skip locked
   )
  returning o.id, o.kind, o.post_id
$$;

-- ...and marks them done.
create function public.finish_outbox(ids bigint[], err text default null) returns void
language sql security definer set search_path = '' as $$
  update private.outbox set sent_at = now(), error = err where id = any (ids)
$$;

revoke execute on function public.claim_outbox(int) from public, anon, authenticated;
revoke execute on function public.finish_outbox(bigint[], text) from public, anon, authenticated;
grant execute on function public.claim_outbox(int) to service_role;
grant execute on function public.finish_outbox(bigint[], text) to service_role;

-- Private helpers: only the ones RLS policies call are executable by signed-in users.
revoke execute on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.my_batch() to authenticated;
