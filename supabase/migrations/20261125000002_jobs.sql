-- Due: background jobs. Pings the app's /api/dispatch route when notifications are
-- queued, and queues deadline reminders every 5 minutes.
--
-- After deploying the app, set its URL and the shared secret (same as DISPATCH_SECRET in Vercel):
--   insert into private.config (key, value) values
--     ('dispatch_url', 'https://<your-app>.vercel.app/api/dispatch'),
--     ('dispatch_secret', '<secret>')
--   on conflict (key) do update set value = excluded.value;

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create table private.config (
  key text primary key,
  value text not null
);

create function private.ping_dispatch() returns void
language plpgsql security definer set search_path = '' as $$
declare
  u text := (select value from private.config where key = 'dispatch_url');
  s text := (select value from private.config where key = 'dispatch_secret');
begin
  if u is null or s is null then
    return; -- not configured yet; events wait in the outbox
  end if;
  perform net.http_post(
    url := u,
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || s),
    timeout_milliseconds := 10000
  );
end
$$;

-- pg_net sends after the transaction commits, so the route sees the new rows.
create function private.outbox_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.ping_dispatch();
  return null;
end
$$;

create trigger outbox_after_insert
  after insert on private.outbox
  for each statement execute function private.outbox_after_insert();

-- Queues reminders, and re-pings if anything is still unsent (e.g. the app was down).
create function private.tick() returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.enqueue_reminders();
  if exists (
    select 1 from private.outbox
     where sent_at is null and attempts < 5 and created_at < now() - interval '2 minutes'
  ) then
    perform private.ping_dispatch();
  end if;
end
$$;

revoke execute on all functions in schema private from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.my_batch() to authenticated;

select cron.schedule('due-tick', '*/5 * * * *', 'select private.tick()');
