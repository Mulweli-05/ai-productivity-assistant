import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Bell, Search, Sparkles } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", icon: "🏠", label: "Dashboard" },
  { to: "/profile", icon: "👤", label: "Student Profile" },
  { to: "/recommendations", icon: "🎯", label: "Bursary Matches" },
  { to: "/email", icon: "📧", label: "Email Generator" },
  { to: "/notes", icon: "📝", label: "Notes Summarizer" },
  { to: "/planner", icon: "📅", label: "AI Planner" },
  { to: "/research", icon: "🔍", label: "Research Assistant" },
  { to: "/chat", icon: "🤖", label: "AI Chatbot" },
  { to: "/tracker", icon: "📋", label: "Application Tracker" },
  { to: "/deadlines", icon: "⏰", label: "Deadlines" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
  { to: "/privacy", icon: "🔒", label: "Privacy Center" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl gradient-brand shadow-[var(--shadow-glow)]">
          <Sparkles className="size-5 text-primary-foreground" />
        </span>
        <span>
          <span className="block font-display text-lg font-bold leading-tight">Bursarie</span>
          <span className="block text-xs text-muted-foreground">AI Assistant</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "gradient-brand font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-sidebar-foreground/80 hover:translate-x-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span aria-hidden className="text-base">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="glass rounded-2xl p-4 text-xs text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Responsible AI</p>
        AI answers may contain errors. Always verify with official bursary providers.
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border bg-sidebar backdrop-blur-2xl lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border bg-popover animate-in slide-in-from-left duration-200">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-xl border border-border p-2 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-bold sm:text-xl">{title}</h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 md:flex">
              <Search className="size-4 text-muted-foreground" />
              <input
                aria-label="Search"
                placeholder="Search bursaries, tasks…"
                className="w-44 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Link
              to="/deadlines"
              aria-label="Notifications"
              className="relative rounded-xl border border-border p-2 transition-colors hover:bg-secondary"
            >
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
