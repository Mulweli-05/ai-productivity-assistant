import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { Badge, Card, EmptyState, Progress, SectionTitle } from "../components/ui-kit";
import { BURSARIES, daysUntil, useLocalState, type Application, type Task } from "../lib/store";

export const Route = createFileRoute("/deadlines")({
  head: () => ({
    meta: [
      { title: "Deadlines & Reminders — Bursarie AI Assistant" },
      { name: "description", content: "Countdown timers, submission reminders and notifications for every bursary deadline." },
      { property: "og:title", content: "Deadlines & Reminders — Bursarie AI Assistant" },
      { property: "og:description", content: "Never miss a bursary closing date again." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeadlinesPage,
});

function DeadlinesPage() {
  const { value: apps } = useLocalState<Application[]>("bursarie.apps", []);
  const { value: tasks } = useLocalState<Task[]>("bursarie.tasks", []);

  const items = BURSARIES.map((b) => ({ b, d: daysUntil(b.closing) })).sort((a, x) => a.d - x.d);
  const notifications = [
    ...items
      .filter((i) => i.d >= 0 && i.d <= 60)
      .map((i) => ({ id: i.b.id, text: `${i.b.name} closes in ${i.d} days`, tone: i.d <= 21 ? "pink" : "gold" })),
    ...tasks
      .filter((t) => !t.done && daysUntil(t.due) <= 7)
      .map((t) => ({ id: t.id, text: `Task due soon: ${t.title}`, tone: "cyan" })),
  ];

  return (
    <AppShell title="Deadlines & Reminders" subtitle="Countdowns, reminders and notifications">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <SectionTitle title="Bursary closing dates" />
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map(({ b, d }) => {
                const applied = apps.some((a) => a.bursaryId === b.id);
                const pct = Math.max(0, Math.min(100, 100 - (d / 180) * 100));
                return (
                  <div key={b.id} className="rounded-2xl border border-border bg-secondary/20 p-4 card-hover">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{b.name}</p>
                      <Badge tone={d < 0 ? "orange" : d <= 21 ? "pink" : "cyan"}>{d < 0 ? "Closed" : `${d}d`}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Closes {b.closing} · {applied ? "Applied ✅" : "Not applied"}
                    </p>
                    <div className="mt-3">
                      <Progress value={pct} tone="warm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Calendar integration" desc="Export deadlines to your own calendar" />
            <div className="grid gap-3 sm:grid-cols-3">
              {["Google Calendar", "Outlook", "Apple Calendar"].map((c) => (
                <div key={c} className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  {c}
                  <p className="mt-1 text-[11px]">Connect coming soon</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <SectionTitle title="Notifications" />
          {notifications.length === 0 ? (
            <EmptyState icon="🔔" title="All clear" desc="No urgent deadlines or tasks right now." />
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="rounded-2xl border border-border bg-secondary/20 p-3 text-sm">
                  <Badge tone={n.tone as "pink" | "gold" | "cyan"}>Reminder</Badge>
                  <p className="mt-2">{n.text}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
