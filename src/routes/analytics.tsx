import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "../components/AppShell";
import { Badge, Card, Ring, SectionTitle } from "../components/ui-kit";
import {
  BURSARIES,
  daysUntil,
  emptyProfile,
  matchScore,
  profileCompletion,
  useLocalState,
  type Application,
  type StudentProfile,
} from "../lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Bursarie AI Assistant" },
      { name: "description", content: "Interactive charts on bursary matches, applications submitted, deadlines and success probability." },
      { property: "og:title", content: "Analytics — Bursarie AI Assistant" },
      { property: "og:description", content: "Visualise match scores, application progress and funding success probability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["#F72585", "#00F5D4", "#FFBE0B", "#FB5607", "#7209B7", "#3A0CA3"];

function AnalyticsPage() {
  const { value: profile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: apps } = useLocalState<Application[]>("bursarie.apps", []);

  const completion = profileCompletion(profile);
  const matchData = BURSARIES.map((b) => ({ name: b.name.split(" ")[0], score: matchScore(b, profile) }));
  const submitted = apps.filter((a) => a.status !== "Not started").length;
  const upcoming = BURSARIES.filter((b) => daysUntil(b.closing) >= 0).length;
  const success = Math.round(Math.min(96, completion * 0.4 + (Math.max(...matchData.map((m) => m.score)) || 0) * 0.4 + Math.min(submitted, 4) * 5));

  const trend = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map((w, i) => ({
    week: w,
    score: Math.min(98, Math.round((completion * 0.5 + 30) * (0.75 + i * 0.05))),
  }));

  const statusData = ["Not started", "In progress", "Submitted", "Interview", "Awarded", "Declined"]
    .map((s) => ({ name: s, value: apps.filter((a) => a.status === s).length }))
    .filter((x) => x.value > 0);

  const tooltipStyle = {
    background: "oklch(0.21 0.11 300)",
    border: "1px solid oklch(1 0 0 / 15%)",
    borderRadius: 12,
    color: "white",
    fontSize: 12,
  };

  return (
    <AppShell title="Analytics" subtitle="Your funding performance at a glance">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { l: "Recommended bursaries", v: matchData.filter((m) => m.score >= 60).length },
            { l: "Applications submitted", v: submitted },
            { l: "Upcoming deadlines", v: upcoming },
            { l: "Success probability", v: `${success}%` },
          ].map((s) => (
            <Card key={s.l} hover>
              <div className="font-display text-2xl font-bold gradient-text">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionTitle title="Match score by bursary" />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,.6)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,.6)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,.05)" }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {matchData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center">
            <SectionTitle title="Completion statistics" />
            <Ring value={completion} label="profile" />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge tone="cyan">{submitted} submitted</Badge>
              <Badge tone="gold">{success}% success odds</Badge>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <SectionTitle title="Match score trend" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F72585" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#7209B7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,.6)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,.6)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="score" stroke="#F72585" strokeWidth={3} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Application statuses" />
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Apply to a bursary to see your status breakdown.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
