import { Segmented } from "@/components/motion/segmented";

export function PageHeader({ title, subtitle, right }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="mb-5 flex items-end justify-between gap-3 pt-3">
      <div className="min-w-0">
        <h1 className="text-[32px] font-bold leading-[1.05]">{title}</h1>
        {subtitle && <div className="mt-1.5 text-[15px] text-muted">{subtitle}</div>}
      </div>
      {right}
    </header>
  );
}

export function FeedTabs({ active }: { active: "upcoming" | "past" }) {
  return (
    <Segmented
      className="mb-6"
      value={active}
      options={[
        { value: "upcoming", label: "Upcoming", href: "/" },
        { value: "past", label: "Past", href: "/past" },
      ]}
    />
  );
}

const DOT = { Today: "bg-accent", Tomorrow: "bg-accent/60", "This week": "bg-warn", Later: "bg-muted/50", "Date TBA": "bg-muted/30" } as Record<string, string>;

export function SectionLabel({ children, count }: { children: string; count?: number }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-2 px-1 text-[13px] font-semibold text-muted">
      <span className={`size-1.5 rounded-full ${DOT[children] ?? "bg-muted/40"}`} />
      {children}
      {count !== undefined && <span className="tabular-nums text-muted/60">{count}</span>}
    </h3>
  );
}

export function Empty({ icon = "✓", title, children }: { icon?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-dashed border-line px-6 py-14 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-[22px] bg-surface-2 text-3xl">{icon}</span>
      <p className="font-display text-lg font-bold">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
