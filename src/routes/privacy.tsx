import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { SHARED_FIELDS } from "../components/ConsentModal";
import { Badge, Btn, Card, EmptyState, Progress, Ring, SectionTitle } from "../components/ui-kit";
import { emptyProfile, useLocalState, type Application, type ConsentRecord, type StudentProfile } from "../lib/store";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Center — Bursarie AI Assistant" },
      { name: "description", content: "POPIA-aligned transparency dashboard: what we collect, what is stored, sharing history and consent management." },
      { property: "og:title", content: "Privacy Center — Bursarie AI Assistant" },
      { property: "og:description", content: "See and control exactly what data is collected, stored and shared." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const COLLECTED = [
  { item: "Personal details (name, ID, contact)", purpose: "Identify you and verify eligibility", stored: "This device (local storage)" },
  { item: "Academic records", purpose: "Calculate match and eligibility scores", stored: "This device (local storage)" },
  { item: "Financial need information", purpose: "Match means-tested bursaries", stored: "This device (local storage)" },
  { item: "Document checklist", purpose: "Track application readiness", stored: "This device (local storage)" },
  { item: "AI prompts you submit", purpose: "Generate responses; not used for training", stored: "Processed transiently, not retained" },
];

function PrivacyPage() {
  const { value: profile, setValue: setProfile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: consents, setValue: setConsents } = useLocalState<ConsentRecord[]>("bursarie.consents", []);
  const { value: apps, setValue: setApps } = useLocalState<Application[]>("bursarie.apps", []);

  const institutions = new Set(consents.map((c) => c.institution)).size;
  const pending = apps.filter((a) => !a.consentAt).length;
  const sensitiveShared = consents.length > 0 ? 1 : 0;
  const privacyScore = Math.max(35, 100 - institutions * 8 - pending * 10 - sensitiveShared * 5);

  return (
    <AppShell title="Privacy Center" subtitle="POPIA-aligned transparency and consent management">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center">
          <SectionTitle title="Privacy score" />
          <Ring value={privacyScore} label="protected" />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Lower when your data is shared with more institutions or consents are pending.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Privacy analytics" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-display text-2xl font-bold">{institutions}</p>
              <p className="text-xs text-muted-foreground">Institutions shared with</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-display text-2xl font-bold">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending consents</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-display text-2xl font-bold">
                {consents[0] ? new Date(consents[0].date).toLocaleDateString() : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Last consent date</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Data minimisation</span>
              <span>{privacyScore}%</span>
            </div>
            <Progress value={privacyScore} />
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <SectionTitle title="What we collect and store" desc="Full transparency on every data point" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-2">Information</th>
                  <th className="pb-2">Why it is used</th>
                  <th className="pb-2">Where it is stored</th>
                </tr>
              </thead>
              <tbody>
                {COLLECTED.map((c) => (
                  <tr key={c.item} className="border-t border-border">
                    <td className="py-3 pr-4">{c.item}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.purpose}</td>
                    <td className="py-3">
                      <Badge tone="cyan">{c.stored}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Data sharing history & consent records" />
          {consents.length === 0 ? (
            <EmptyState icon="🔒" title="Nothing shared yet" desc="Your data has not been shared with any institution. Sharing only happens after you consent." />
          ) : (
            <ul className="space-y-3">
              {consents.map((c) => (
                <li key={c.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{c.institution}</p>
                    <Badge tone="gold">{new Date(c.date).toLocaleString()}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.purpose}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.fields.map((f) => (
                      <Badge key={f} tone="violet">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setConsents(consents.filter((x) => x.id !== c.id));
                      toast.success("Consent withdrawn");
                    }}
                    className="mt-3 text-xs font-semibold text-pink underline"
                  >
                    Withdraw consent
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="Fields shared on apply" />
            <ul className="space-y-2 text-sm">
              {SHARED_FIELDS.map((f) => (
                <li key={f.label}>
                  <span className="text-cyan">✅</span> {f.label}
                  <span title={f.why} className="ml-2 cursor-help text-[11px] text-cyan underline decoration-dotted">
                    Why is this needed?
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle title="Your controls" />
            <div className="space-y-2">
              <Btn
                variant="outline"
                className="w-full"
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ profile, apps, consents }, null, 2)], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "bursarie-my-data.json";
                  a.click();
                }}
              >
                Export my data
              </Btn>
              <Btn
                variant="outline"
                className="w-full"
                onClick={() => {
                  setProfile(emptyProfile);
                  setApps([]);
                  setConsents([]);
                  toast.success("All local data deleted");
                }}
              >
                Delete all my data
              </Btn>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <SectionTitle title="Responsible AI disclaimer" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Bursary AI Assistant uses artificial intelligence to provide bursary recommendations, application support,
            research assistance, and productivity tools. AI-generated responses may contain errors and should always be
            verified with official bursary providers. Personal information is never shared with third parties without
            explicit user consent. Students remain in control of their personal data at all times.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
