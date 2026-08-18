import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`glass rounded-3xl p-5 ${hover ? "card-hover" : ""} ${className}`}>{children}</div>
  );
}

export function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gradient" | "outline" | "ghost" | "warm";
  loading?: boolean;
};

export function Btn({ variant = "gradient", loading, className = "", children, ...rest }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const variants: Record<string, string> = {
    gradient: "gradient-brand text-primary-foreground hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5",
    warm: "gradient-warm text-[oklch(0.2_0.1_60)] hover:-translate-y-0.5",
    outline: "border border-border bg-secondary/30 hover:bg-secondary",
    ghost: "hover:bg-secondary/60",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  why,
  children,
}: {
  label: string;
  hint?: string;
  why?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        {label}
        {why && (
          <span
            title={why}
            className="cursor-help rounded-full border border-border px-2 py-0.5 text-[10px] text-cyan"
          >
            Why is this needed?
          </span>
        )}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-secondary/30 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-32 ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputCls} [&>option]:bg-popover ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function Badge({
  children,
  tone = "violet",
}: {
  children: ReactNode;
  tone?: "violet" | "pink" | "cyan" | "gold" | "orange";
}) {
  const tones: Record<string, string> = {
    violet: "bg-primary/25 text-foreground border-primary/40",
    pink: "bg-pink/20 text-pink border-pink/40",
    cyan: "bg-cyan/15 text-cyan border-cyan/40",
    gold: "bg-gold/15 text-gold border-gold/40",
    orange: "bg-orange/15 text-orange border-orange/40",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Progress({ value, tone = "brand" }: { value: number; tone?: "brand" | "warm" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/60">
      <div
        className={tone === "warm" ? "h-full gradient-warm" : "h-full gradient-brand"}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, transition: "width .5s ease" }}
      />
    </div>
  );
}

export function Ring({ value, label }: { value: number; label: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-32 place-items-center">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7209B7" />
            <stop offset="50%" stopColor="#F72585" />
            <stop offset="100%" stopColor="#FFBE0B" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} strokeWidth="12" className="stroke-secondary" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={r}
          strokeWidth="12"
          stroke="url(#ringGrad)"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.max(0, Math.min(100, value))) / 100}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold">{Math.round(value)}%</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, desc, icon = "✨" }: { title: string; desc: string; icon?: string }) {
  return (
    <div className="glass rounded-3xl p-10 text-center">
      <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl gradient-cool text-2xl">{icon}</div>
      <p className="font-display font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function AIDisclaimer() {
  return (
    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
      AI-generated content may contain errors. Always verify details with official bursary providers.
    </p>
  );
}
