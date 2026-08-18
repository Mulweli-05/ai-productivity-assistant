import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { Badge, Card, EmptyState, Progress, Ring, SectionTitle, Select } from "../components/ui-kit";
import {
  BURSARIES,
  REQUIRED_DOCS,
  emptyProfile,
  profileCompletion,
  useLocalState,
  type Application,
  type StudentProfile,
} from "../lib/store";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Application Tracker — Bursarie AI Assistant" },
      { name: "description", content: "Track profile completion, documents, references and submitted bursary applications in one place." },
      { property: "og:title", content: "Application Tracker — Bursarie AI Assistant" },
      { property: "og:description", content: "Milestones, statuses and progress for every bursary application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackerPage,
});

const STATUSES: Application["status"][] = ["Not started", "In progress", "Submitted", "Interview", "Awarded", "Declined"];

function TrackerPage() {
  const { value: profile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: apps, setValue: setApps } = useLocalState<Application[]>("bursarie.apps", []);

  const completion = profileCompletion(profile);
  const docPct = (profile.documents.length / REQUIRED_DOCS.length) * 100;
  const refs = apps.reduce((s, a) => s + a.referencesReceived, 0);
  const submitted = apps.filter((a) => ["Submitted", "Interview", "Awarded"].includes(a.status)).length;
  const overall = Math.round(completion * 0.35 + docPct * 0.25 + Math.min(refs / 3, 1) * 100 * 0.15 + Math.min(submitted / 3, 1) * 100 * 0.25);

  const milestones = [
    { label: "Profile completed", done: completion >= 90 },
    { label: "All documents ready", done: profile.documents.length === REQUIRED_DOCS.length },
    { label: "References received", done: refs >= 2 },
    { label: "First application submitted", done: submitted >= 1 },
    { label: "Three applications submitted", done: submitted >= 3 },
  ];

  return (
    <AppShell title="Application Tracker" subtitle="Every milestone on your funding journey">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center">
          <SectionTitle title="Overall progress" />
          <Ring value={overall} label="journey" />
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Progress breakdown" />
          <div className="space-y-4">
            {[
              { label: "Profile completion", v: completion },
              { label: "Documents uploaded", v: docPct },
              { label: "References received", v: Math.min(refs / 3, 1) * 100 },
              { label: "Applications submitted", v: Math.min(submitted / 3, 1) * 100 },
            ].map((r) => (
              <div key={r.label}>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{r.label}</span>
                  <span>{Math.round(r.v)}%</span>
                </div>
                <Progress value={r.v} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <SectionTitle title="Applications" desc="Update the status as your journey progresses" />
          {apps.length === 0 ? (
            <EmptyState icon="📋" title="No applications yet" desc="Apply from the Bursary Matches page to start tracking progress." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {apps.map((a) => {
                const b = BURSARIES.find((x) => x.id === a.bursaryId);
                return (
                  <div key={a.bursaryId} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{b?.name ?? a.bursaryId}</p>
                        <p className="text-xs text-muted-foreground">{b?.sponsor}</p>
                      </div>
                      <Badge tone={a.status === "Awarded" ? "cyan" : a.status === "Declined" ? "orange" : "gold"}>
                        {a.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Consent given {a.consentAt ? new Date(a.consentAt).toLocaleDateString() : "—"}
                    </p>
                    <div className="mt-3">
                      <Select
                        value={a.status}
                        onChange={(e) =>
                          setApps(
                            apps.map((x) =>
                              x.bursaryId === a.bursaryId ? { ...x, status: e.target.value as Application["status"] } : x,
                            ),
                          )
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <SectionTitle title="Milestones" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`rounded-2xl border p-4 text-sm ${m.done ? "border-cyan/40 bg-cyan/10" : "border-border bg-secondary/20 opacity-70"}`}
              >
                <div className="text-xl">{m.done ? "✅" : "⏳"}</div>
                <p className="mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
