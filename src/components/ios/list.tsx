import Link from "next/link";
import { ChevronRight } from "./icons";

/** Inset grouped section, like iOS Settings: optional header and footer text. */
export function Section({ header, footer, children, className = "" }: { header?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-4 mb-8 ${className}`}>
      {header && <h3 className="mb-1.5 px-4 text-[13px] uppercase tracking-[0.02em] text-label-2">{header}</h3>}
      <div className="ios-group overflow-hidden rounded-[10px] bg-cell">{children}</div>
      {footer && <div className="mt-1.5 px-4 text-[13px] leading-[18px] text-label-2">{footer}</div>}
    </section>
  );
}

/** Rounded-square icon used in Settings rows. */
export function RowIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="flex size-[29px] shrink-0 items-center justify-center rounded-[7px] text-white" style={{ background: color }}>
      {children}
    </span>
  );
}

type RowProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  accessory?: React.ReactNode;
  chevron?: boolean;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  destructive?: boolean;
  tinted?: boolean;
  center?: boolean;
};

/** One list cell. Separators are inset to the text, and the last row has none. */
export function Row({ icon, title, subtitle, value, accessory, chevron, href, external, onClick, destructive, tinted, center }: RowProps) {
  const body = (
    <div className="flex min-h-11 items-center gap-3 pl-4">
      {icon}
      <div className="row-sep flex min-w-0 flex-1 items-center gap-3 py-[11px] pr-4">
        <div className={`min-w-0 flex-1 ${center ? "text-center" : ""}`}>
          <div className={`text-[17px] leading-[22px] ${destructive ? "text-red" : tinted ? "text-tint" : ""}`}>{title}</div>
          {subtitle && <div className="mt-0.5 text-[15px] leading-5 text-label-2">{subtitle}</div>}
        </div>
        {value !== undefined && <span className="shrink-0 text-[17px] text-label-2">{value}</span>}
        {accessory}
        {chevron && <ChevronRight className="shrink-0 text-label-3" />}
      </div>
    </div>
  );
  const cls = "block w-full text-left transition-colors active:bg-cell-2";
  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  return <div>{body}</div>;
}
