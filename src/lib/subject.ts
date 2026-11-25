// Guesses a post's subject from its title (and note) so every card gets a colour and icon.
// Order matters: the first match wins, so specific subjects come before generic ones.

export type Subject = { key: string; label: string; emoji: string; color: string };

const RULES: [RegExp, Subject][] = [
  [/\b(dsa|algo|algorithms?|data structures?|leetcode|codeforces|contest|cp)\b/i, { key: "dsa", label: "DSA", emoji: "🧮", color: "#7c5cff" }],
  [/\b(dbms|sql|database|mysql|postgres|mongo)\b/i, { key: "dbms", label: "DBMS", emoji: "🗄️", color: "#3b82f6" }],
  [/\b(os|operating systems?|linux|unix|shell)\b/i, { key: "os", label: "OS", emoji: "🖥️", color: "#06b6d4" }],
  [/\b(cn|computer networks?|networking|tcp|http)\b/i, { key: "cn", label: "Networks", emoji: "🌐", color: "#14b8a6" }],
  [/\b(ai|ml|machine learning|deep learning|llm|genai|neural)\b/i, { key: "ai", label: "AI / ML", emoji: "🤖", color: "#ec4899" }],
  [/\b(web|react|next\.?js|javascript|js|html|css|frontend|backend|node|devops|docker|aws|cloud)\b/i, { key: "dev", label: "Dev", emoji: "💻", color: "#0ea5e9" }],
  [/\b(maths?|calculus|probability|statistics|stats|linear algebra|discrete|fmi)\b/i, { key: "math", label: "Maths", emoji: "➗", color: "#f59e0b" }],
  [/\b(c\+\+|cpp|java|python|oops?|lld|hld|system design)\b/i, { key: "prog", label: "Programming", emoji: "⌨️", color: "#8b5cf6" }],
  [/\b(hackathons?|buildathon|ideathon)\b/i, { key: "hack", label: "Hackathon", emoji: "🚀", color: "#6366f1" }],
  [/\b(internships?|placements?|jobs?|resume|cv|interview|recruit|hiring)\b/i, { key: "career", label: "Career", emoji: "💼", color: "#10b981" }],
  [/\b(exams?|quiz|test|mid-?sem|end-?sem|viva|assessment)\b/i, { key: "exam", label: "Exam", emoji: "📚", color: "#f43f5e" }],
  [/\b(event|club|fest|workshop|session|talk|seminar|meetup)\b/i, { key: "event", label: "Event", emoji: "🎉", color: "#d946ef" }],
  [/\b(forms?|registration|register|survey|feedback|fee|fees|apply|application|sign ?up)\b/i, { key: "form", label: "Form", emoji: "📝", color: "#22c55e" }],
  [/\b(assignments?|homework|hw|lab|project|submission|report)\b/i, { key: "work", label: "Assignment", emoji: "📎", color: "#ff6b3d" }],
];

export const DEFAULT_SUBJECT: Subject = { key: "other", label: "Deadline", emoji: "📌", color: "#ff6b3d" };

export function subjectOf(title: string, note?: string | null): Subject {
  for (const [re, s] of RULES) if (re.test(title)) return s;
  if (note) for (const [re, s] of RULES) if (re.test(note)) return s;
  return DEFAULT_SUBJECT;
}

/** Inline style vars so a card/tile can use its subject colour in both themes. */
export function subjectVars(s: Subject): React.CSSProperties {
  return { "--sub": s.color } as React.CSSProperties;
}
