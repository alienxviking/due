// Everyone using Due is in India, and the server runs in UTC, so all deadline
// formatting and parsing is pinned to IST.
export const TZ = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

const fmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDeadline(iso: string | null): string {
  if (!iso) return "Deadline TBA";
  return fmt.format(new Date(iso)).replace(/\b(am|pm)\b/, (m) => m.toUpperCase());
}

/** ISO -> { date: "2026-11-28", time: "23:59" } in IST, for form defaults. */
export function toISTParts(iso: string): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function todayIST(): string {
  return toISTParts(new Date().toISOString()).date;
}

/** Form date + time (IST) -> ISO string, or null if invalid. */
export function fromISTParts(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const d = new Date(`${date}T${time}:00${IST_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const tileFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });

/** { weekday: "Fri", day: "28", month: "Nov" } in IST, for the calendar tile on cards. */
export function tileParts(iso: string) {
  const p = Object.fromEntries(tileFmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { weekday: p.weekday, day: p.day, month: p.month };
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso)).replace(/\b(am|pm)\b/, (m) => m.toUpperCase());
}

export const GROUPS = ["Today", "Tomorrow", "This week", "Later", "Date TBA"] as const;
export type Group = (typeof GROUPS)[number];

/** Which feed section a deadline belongs to, by IST calendar day. */
export function groupOf(iso: string | null, now = Date.now()): Group {
  if (!iso) return "Date TBA";
  const day = (d: number) => toISTParts(new Date(d).toISOString()).date;
  const target = toISTParts(iso).date;
  if (target <= day(now)) return "Today";
  if (target === day(now + 86400e3)) return "Tomorrow";
  if (target <= day(now + 6 * 86400e3)) return "This week";
  return "Later";
}

/** Date string (IST) n days from today, for the quick-pick chips. */
export function addDaysIST(n: number): string {
  return toISTParts(new Date(Date.now() + n * 86400e3).toISOString()).date;
}

export function timeLeft(iso: string, now = Date.now()): { label: string; tone: "urgent" | "soon" | "calm" | "past" } {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return { label: "Closed", tone: "past" };
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const label = days > 0 ? `${days}d ${hours}h left` : hours > 0 ? `${hours}h ${m}m left` : `${Math.max(m, 1)}m left`;
  const tone = ms < 24 * 3600e3 ? "urgent" : ms < 72 * 3600e3 ? "soon" : "calm";
  return { label, tone };
}
