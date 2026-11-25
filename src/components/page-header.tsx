import Link from "next/link";

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="mb-5 flex items-end justify-between gap-3 pt-2">
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function FeedTabs({ active }: { active: "upcoming" | "past" }) {
  const tab = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      className={`flex-1 rounded-[10px] py-2 text-center text-sm font-semibold transition-colors ${on ? "bg-surface text-text shadow-card" : "text-muted"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-5 flex gap-1 rounded-xl bg-surface-2 p-1">
      {tab("/", "Upcoming", active === "upcoming")}
      {tab("/past", "Past", active === "past")}
    </div>
  );
}

export function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
      {count !== undefined && <span className="rounded-full bg-surface-2 px-1.5 py-px text-[10px] tabular-nums">{count}</span>}
    </h3>
  );
}

export function Empty({ icon = "✓", title, children }: { icon?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="rise flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-2 text-xl">{icon}</span>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
