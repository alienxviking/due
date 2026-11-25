import Link from "next/link";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </header>
  );
}

export function FeedTabs({ active }: { active: "upcoming" | "past" }) {
  const tab = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium ${on ? "bg-surface text-text" : "text-muted"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-4 flex gap-1 rounded-xl border border-line p-1">
      {tab("/", "Upcoming", active === "upcoming")}
      {tab("/past", "Past", active === "past")}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">{children}</p>;
}
