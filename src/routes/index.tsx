import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { Badge, Card, Progress, Ring, SectionTitle } from "../components/ui-kit";
import {
  BURSARIES,
  daysUntil,
  emptyProfile,
  matchScore,
  profileCompletion,
  useLocalState,
  type Application,
  type StudentProfile,
  type Task,
} from "../lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bursarie AI Assistant — Student Funding Dashboard" },
      {
        name: "description",
        content:
          "Discover bursaries, generate applications, track deadlines and get AI guidance through your student funding journey.",
      },
      { property: "og:title", content: "Bursarie AI Assistant — Student Funding Dashboard" },
      {
        property: "og:description",
        content: "AI-powered bursary discovery, applications, deadlines and responsible data sharing for students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { value: profile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: apps } = useLocalState<Application[]>("bursarie.apps", []);
  const { value: tasks } = useLocalState<Task[]>("bursarie.tasks", []);

  const completion = profileCompletion(profile);
  const matches = BURSARIES.map((b) => ({ b, score: matchScore(b, profile) })).sort((a, x) => x.score - a.score);
  const submitted = apps.filter((a) => a.status !== "Not started").length;
  const upcoming = BURSARIES.map((b) => ({ b, d: daysUntil(b.closing) }))
    .filter((x) => x.d >= 0)
    .sort((a, x) => a.d - x.d)
    .slice(0, 4);
  const success = Math.round(
    Math.min(96, completion * 0.4 + (matches[0]?.score ?? 0) * 0.4 + Math.min(submitted, 4) * 5),
  );

  const stats = [
    { label: "Bursary matches", value: matches.filter((m) => m.score >= 60).length, tone: "pink" as const, icon: "🎯" },
    { label: "Applications", value: submitted, tone: "cyan" as const, icon: "📋" },
    { label: "Open tasks", value: tasks.filter((t) => !t.done).length, tone: "gold" as const, icon: "📅" },
    { label: "Next deadline", value: upcoming[0] ? `${upcoming[0].d}d` : "—", tone: "orange" as const, icon: "⏰" },
  ];

  return (
    <AppShell title="Dashboard" subtitle="Empowering Students to Secure Funding Through AI">
      <div className="space-y-6">
        <Card className="overflow-hidden !p-0">
          <div className="gradient-cool p-6 sm:p-8">
            <Badge tone="gold">POPIA-aware · Responsible AI</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
              Welcome{profile.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""} 👋
            </h2>
            <p className="mt-2 max-w-xl text-sm text-foreground/80">
              Your AI co-pilot for bursary discovery, applications, documents and deadlines — built for South African
              students.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/recommendations" className="rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold">
                Find my bursaries
              </Link>
              <Link to="/chat" className="rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-semibold">
                Ask the AI assistant
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} hover>
              <div className="mb-2 text-xl">{s.icon}</div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionTitle title="Top bursary matches" desc="Ranked from your profile, marks and financial need" />
            <div className="space-y-3">
              {matches.slice(0, 4).map(({ b, score }) => (
                <Link
                  key={b.id}
                  to="/recommendations"
                  className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/20 p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.sponsor} · closes {b.closing}
                    </p>
                    <div className="mt-2">
                      <Progress value={score} />
                    </div>
                  </div>
                  <Badge tone={score >= 75 ? "cyan" : score >= 55 ? "gold" : "orange"}>{score}% match</Badge>
                </Link>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="flex flex-col items-center">
              <SectionTitle title="Profile completion" />
              <Ring value={completion} label="complete" />
              <Link to="/profile" className="mt-4 text-sm font-semibold text-cyan">
                Complete profile →
              </Link>
            </Card>
            <Card>
              <SectionTitle title="Success probability" />
              <div className="font-display text-3xl font-bold gradient-text">{success}%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on profile strength, match quality and submitted applications.
              </p>
            </Card>
          </div>
        </div>

        <Card>
          <SectionTitle title="Upcoming deadlines" desc="Countdown to closing dates" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map(({ b, d }) => (
              <div key={b.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                <p className="text-sm font-semibold">{b.name}</p>
                <p className="mt-1 font-display text-2xl font-bold text-gold">{d}</p>
                <p className="text-xs text-muted-foreground">days left · {b.closing}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
