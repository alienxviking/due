// Runs both migrations against an in-memory Postgres (PGlite) with stand-ins for
// Supabase auth/roles/pg_net/pg_cron, and checks the access rules and notification events.
// Run: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../migrations", import.meta.url));
const db = new PGlite();
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) fails++; };
const q = async (sql, params) => (await db.query(sql, params)).rows;
const as = async (uid, sql, params) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  if (uid) await db.exec("set role authenticated");
  try { return await q(sql, params); } finally { await db.exec("reset role"); }
};
const err = async (fn) => { try { await fn(); return null; } catch (e) { await db.exec("reset role"); return e.message; } };

// Supabase stand-ins
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create role service_role nologin bypassrls; create role supabase_auth_admin nologin;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  create schema extensions; create schema net; create schema cron;
  create table net.calls (url text, headers jsonb);
  grant usage on schema net to public; grant insert on net.calls to public;
  create function net.http_post(url text, body jsonb, headers jsonb, timeout_milliseconds int) returns bigint
    language sql as $$ insert into net.calls values (url, headers); select 1::bigint $$;
  create table cron.jobs (name text, sched text, cmd text);
  create function cron.schedule(n text, s text, c text) returns bigint language sql as $$ insert into cron.jobs values (n, s, c); select 1::bigint $$;
`);
for (const f of ["20261125000001_schema.sql", "20261125000002_jobs.sql"]) {
  const sql = readFileSync(`${dir}/${f}`, "utf8").replace(/create extension[^;]*;/g, "");
  await db.exec(sql);
}
console.log("migrations applied");

const signup = (email, name = "X") =>
  q("insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id", [email, { full_name: name }]).then(r => r[0].id);

// --- sign-in rules
const admin = await signup("snehangshu.24bcs10155@sst.scaler.com", "Snehangshu Roy");
const f1 = await signup("Amit.24bcs10001@sst.scaler.com", "Amit");
const f2 = await signup("riya.24bcs10002@sst.scaler.com", "Riya");
ok((await err(() => signup("x.25bcs10001@sst.scaler.com"))) !== null, "25bcs rejected");
ok((await err(() => signup("someone@sst.scaler.com"))) !== null, "no-batch email rejected");
ok((await err(() => signup("a.24bcs1@gmail.com"))) !== null, "gmail rejected");
ok((await err(() => signup("a.24bcs1@sst.scaler.com.evil.com"))) !== null, "lookalike domain rejected");
const hookBad = (await q("select public.hook_before_user_created($1) r", [{ user: { email: "x.26bcs1@sst.scaler.com" } }]))[0].r;
const hookGood = (await q("select public.hook_before_user_created($1) r", [{ user: { email: "y.24bcs1@sst.scaler.com" } }]))[0].r;
ok(hookBad.error?.http_code === 403 && JSON.stringify(hookGood) === "{}", "auth hook allows 24bcs, blocks 26bcs");
const profs = await q("select email, batch, role from public.profiles order by email");
ok(profs.find(p => p.email.startsWith("snehangshu")).role === "admin", "admin seeded by email");
ok(profs.find(p => p.email.startsWith("amit")).role === "user" && profs.every(p => p.batch === "24bcs"), "friends are users in 24bcs, email lowercased");

// --- profiles
ok((await as(f1, "select * from public.profiles")).length === 1, "user sees only own profile");
ok((await as(admin, "select * from public.profiles")).length === 3, "admin sees all profiles");
await as(f1, "update public.profiles set role = 'admin' where id = auth.uid()");
ok((await q("select role from public.profiles where id = $1", [f1]))[0].role === "user", "user can't make self admin");

// --- private schema
ok((await err(() => as(f1, "select * from private.outbox"))) !== null, "user can't read outbox");
ok((await err(() => as(f1, "select * from private.allowed_batches"))) !== null, "user can't read allowed batches");
ok((await err(() => as(f1, "insert into private.allowed_batches values ('25bcs')"))) !== null, "user can't add a batch");
ok((await err(() => as(f1, "select private.enqueue_reminders()"))) !== null, "user can't run reminder job");

// --- submitting
const p1 = (await as(f1, `insert into public.posts (title, url, deadline, status, author_id, batch)
  values ('  DSA Assignment 4 ', 'https://forms.gle/abc', now() + interval '3 days', 'approved', '${f2}', '25bcs') returning *`))[0];
ok(p1.status === "pending" && p1.author_id === f1 && p1.batch === "24bcs" && p1.author_name === "Amit", "client can't spoof status/author/batch");
ok(p1.title === "DSA Assignment 4", "title trimmed");
ok((await err(() => as(f1, "insert into public.posts (title, url) values ('x', 'javascript:alert(1)')"))) !== null, "non-http link rejected");
ok((await err(() => as(f1, "insert into public.posts (title, url) values ('', 'https://a.b')"))) !== null, "empty title rejected");
ok((await err(() => db.exec("set role anon; insert into public.posts (title, url, batch) values ('x','https://a.b','24bcs')"))) !== null, "anon can't post");

ok((await as(f2, "select * from public.posts where id = $1", [p1.id])).length === 0, "others can't see pending post");
ok((await as(f1, "select * from public.posts where id = $1", [p1.id])).length === 1, "author sees own pending post");
ok((await as(admin, "select * from public.posts where id = $1", [p1.id])).length === 1, "admin sees pending post");

await as(f1, "update public.posts set status = 'approved', note = 'edited' where id = $1", [p1.id]);
let row = (await q("select * from public.posts where id = $1", [p1.id]))[0];
ok(row.status === "pending" && row.note === "edited", "author can edit pending content but not approve");
ok((await as(f2, "update public.posts set title = 'hacked' where id = $1 returning id", [p1.id])).length === 0, "others can't edit");

// --- approval
await as(admin, "update public.posts set status = 'approved' where id = $1", [p1.id]);
row = (await q("select * from public.posts where id = $1", [p1.id]))[0];
ok(row.status === "approved" && row.approved_by === admin && row.approved_at, "admin approves");
ok((await as(f2, "select * from public.posts where id = $1", [p1.id])).length === 1, "approved post visible to batch");
ok((await as(f1, "update public.posts set title = 'x' where id = $1 returning id", [p1.id])).length === 0, "author can't edit after approval");
ok((await as(f1, "delete from public.posts where id = $1 returning id", [p1.id])).length === 0, "author can't delete approved post");

// --- rejection
const p2 = (await as(f2, "insert into public.posts (title, url) values ('spam', 'https://x.y') returning id"))[0];
await as(admin, "update public.posts set status = 'rejected', reject_reason = 'Duplicate' where id = $1", [p2.id]);
ok((await as(f2, "select reject_reason from public.posts where id = $1", [p2.id]))[0].reject_reason === "Duplicate", "author sees reject reason");
ok((await as(f2, "delete from public.posts where id = $1 returning id", [p2.id])).length === 1, "author can delete rejected post");

// --- admin post + TBA flow
const p3 = (await as(admin, "insert into public.posts (title, url) values ('Hackathon form', 'https://h.k') returning *"))[0];
ok(p3.status === "approved", "admin post skips queue");
await as(admin, "update public.posts set deadline = now() + interval '5 days' where id = $1", [p3.id]);
await as(admin, "update public.posts set deadline = now() + interval '6 days' where id = $1", [p3.id]);

const kinds = (await q("select kind from private.outbox order by id")).map(r => r.kind);
ok(JSON.stringify(kinds) === JSON.stringify(["submitted", "approved", "approved", "deadline_set", "deadline_changed"]),
  "outbox events: " + kinds.join(","));

// --- premark + reminders
const p4 = (await as(admin, "insert into public.posts (title, url, deadline) values ('Soon', 'https://s.o', now() + interval '5 hours') returning *"))[0];
ok(p4.reminded_24h_at && !p4.reminded_2h_at, "post due in 5h: 24h reminder pre-marked");
await db.exec("alter table public.posts disable trigger posts_before_update");
await q(`update public.posts set deadline = now() + interval '23 hours', reminded_24h_at = null, reminded_2h_at = null where id = $1`, [p1.id]);
await q(`update public.posts set deadline = now() + interval '90 minutes', reminded_24h_at = now(), reminded_2h_at = null where id = $1`, [p4.id]);
await db.exec("alter table public.posts enable trigger posts_before_update");
await db.exec("delete from private.outbox");
ok((await q("select private.enqueue_reminders() n"))[0].n === 2, "two reminders queued");
ok((await q("select private.enqueue_reminders() n"))[0].n === 0, "reminders never queued twice");
const rk = await q("select kind, post_id from private.outbox order by kind");
ok(rk.length === 2 && rk[0].kind === "reminder_24h" && rk[0].post_id === p1.id && rk[1].kind === "reminder_2h" && rk[1].post_id === p4.id, "right reminder for each post");
await as(admin, "update public.posts set deadline = now() + interval '4 days' where id = $1", [p1.id]);
ok(!(await q("select reminded_24h_at from public.posts where id = $1", [p1.id]))[0].reminded_24h_at, "moving a deadline resets reminders");

// --- dispatch plumbing
ok((await q("select count(*)::int n from net.calls"))[0].n === 0, "no ping before config is set");
await q("insert into private.config values ('dispatch_url', 'https://due.test/api/dispatch'), ('dispatch_secret', 's3cret')");
await as(f1, "insert into public.posts (title, url) values ('ping me', 'https://p.m')");
const calls = await q("select * from net.calls");
ok(calls.length === 1 && calls[0].headers.Authorization === "Bearer s3cret", "outbox insert pings dispatcher");
ok((await err(() => as(f1, "select * from public.claim_outbox(10)"))) !== null, "user can't claim outbox");
await db.exec("set role service_role");
const claimed = await q("select * from public.claim_outbox(10)");
const again = await q("select * from public.claim_outbox(10)");
await q("select public.finish_outbox($1)", [claimed.map(c => c.id)]);
await db.exec("reset role");
ok(claimed.length === 4 && again.length === 0, `service role claims each event once (${claimed.length})`);
ok((await q("select count(*)::int n from private.outbox where sent_at is null"))[0].n === 0, "finished events marked sent");
await db.exec("select private.tick()");
ok((await q("select count(*)::int n from cron.jobs"))[0].n === 1, "cron job scheduled");

// --- push subscriptions
await as(f1, "select public.save_push_subscription('https://push/1', 'k', 'a')");
await as(f2, "select public.save_push_subscription('https://push/1', 'k2', 'a2')");
ok((await as(f1, "select * from public.push_subscriptions")).length === 0, "shared device moves to latest user");
ok((await as(f2, "select * from public.push_subscriptions")).length === 1, "user sees own device");
ok((await err(() => as(f1, "insert into public.push_subscriptions values ('https://push/2', $1, 'k', 'a')", [f2]))) !== null, "can't register device for someone else");

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
