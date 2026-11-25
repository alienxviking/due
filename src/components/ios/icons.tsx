// Line icons drawn to sit next to SF Symbols: 24px grid, round caps, ~1.8 stroke.
type P = { className?: string; size?: number; filled?: boolean };

const base = (size = 24) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const CalendarIcon = ({ className, size, filled }: P) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" fill={filled ? "currentColor" : "none"} />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke={filled ? "var(--cell)" : "currentColor"} />
  </svg>
);
export const PersonIcon = ({ className, size, filled }: P) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <circle cx="12" cy="8" r="4" fill={filled ? "currentColor" : "none"} />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0z" fill={filled ? "currentColor" : "none"} />
  </svg>
);
export const TrayIcon = ({ className, size, filled }: P) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <path d="M3.5 13.5 6 5.5A2 2 0 0 1 7.9 4h8.2A2 2 0 0 1 18 5.5l2.5 8v5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" fill={filled ? "currentColor" : "none"} />
    <path d="M3.5 13.5h4.5l1.5 2.5h5l1.5-2.5h4.5" stroke={filled ? "var(--cell)" : "currentColor"} />
  </svg>
);
export const GearIcon = ({ className, size, filled }: P) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <path
      fill={filled ? "currentColor" : "none"}
      d="M10.3 3.2h3.4l.5 2.4a6.8 6.8 0 0 1 1.7 1l2.3-.8 1.7 3-1.8 1.6a6.8 6.8 0 0 1 0 2l1.8 1.6-1.7 3-2.3-.8a6.8 6.8 0 0 1-1.7 1l-.5 2.4h-3.4l-.5-2.4a6.8 6.8 0 0 1-1.7-1l-2.3.8-1.7-3 1.8-1.6a6.8 6.8 0 0 1 0-2L4.1 8.8l1.7-3 2.3.8a6.8 6.8 0 0 1 1.7-1z"
    />
    <circle cx="12" cy="12" r="2.8" stroke={filled ? "var(--cell)" : "currentColor"} />
  </svg>
);
export const PlusIcon = ({ className, size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.2} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const ChevronRight = ({ className, size = 14 }: P) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1.5 1.5 6.5 7l-5 5.5" />
  </svg>
);
export const ChevronLeft = ({ className, size = 20 }: P) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2 2 10l8 8" />
  </svg>
);
export const BellIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={0} className={className}>
    <path fill="currentColor" d="M12 2.5a6 6 0 0 0-6 6v3.6l-1.6 3.2A1 1 0 0 0 5.3 17h13.4a1 1 0 0 0 .9-1.5L18 12.1V8.5a6 6 0 0 0-6-6zm-2.6 15.5a2.7 2.7 0 0 0 5.2 0z" />
  </svg>
);
export const ClockIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const ListIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={2.2} className={className}>
    <path d="M9 7h11M9 12h11M9 17h11" />
    <circle cx="4.5" cy="7" r="1" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" />
    <circle cx="4.5" cy="17" r="1" fill="currentColor" />
  </svg>
);
export const QuestionIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={2.2} className={className}>
    <path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.5-2.8 4.2M12 17.6h.01" />
  </svg>
);
export const CheckIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={2.4} className={className}>
    <path d="M5 12.5 10 17.5 19.5 7" />
  </svg>
);
export const XIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={2.4} className={className}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
);
export const ShareIcon = ({ className, size = 18 }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
);
export const PhoneIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={0} className={className}>
    <path fill="currentColor" d="M8 2h8a2.5 2.5 0 0 1 2.5 2.5v15A2.5 2.5 0 0 1 16 22H8a2.5 2.5 0 0 1-2.5-2.5v-15A2.5 2.5 0 0 1 8 2zm2.5 17a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5z" />
  </svg>
);
export const PaperplaneIcon = ({ className, size }: P) => (
  <svg {...base(size)} strokeWidth={0} className={className}>
    <path fill="currentColor" d="M21.4 3.4a.8.8 0 0 0-.9-.2L3 10.6a.8.8 0 0 0 .1 1.5l7 2.3 2.4 7a.8.8 0 0 0 1.5.1l7.5-17.5a.8.8 0 0 0-.1-.6z" />
  </svg>
);
