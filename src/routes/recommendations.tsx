import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { ConsentModal, SHARED_FIELDS } from "../components/ConsentModal";
import { Badge, Btn, Card, Input, Progress, SectionTitle } from "../components/ui-kit";
import {
  BURSARIES,
  daysUntil,
  emptyProfile,
  matchScore,
  useLocalState,
  type Application,
  type Bursary,
  type ConsentRecord,
  type StudentProfile,
} from "../lib/store";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Bursary Recommendations — Bursarie AI Assistant" },
      { name: "description", content: "AI-ranked bursary matches with eligibility scores, closing dates and consent-protected applications." },
      { property: "og:title", content: "Bursary Recommendations — Bursarie AI Assistant" },
      { property: "og:description", content: "See your match percentage, eligibility score and requirements for each bursary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const { value: profile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: apps, setValue: setApps } = useLocalState<Application[]>("bursarie.apps", []);
  const { value: consents, setValue: setConsents } = useLocalState<ConsentRecord[]>("bursarie.consents", []);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Bursary | null>(null);

  const list = BURSARIES.map((b) => ({ b, score: matchScore(b, profile) }))
    .filter(
      ({ b }) =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.sponsor.toLowerCase().includes(query.toLowerCase()) ||
        b.fields.join(" ").toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, x) => x.score - a.score);

  const statusOf = (id: string) => apps.find((a) => a.bursaryId === id)?.status ?? "Not started";

  function confirmConsent() {
    if (!pending) return;
    const now = new Date().toISOString();
    setApps([
      ...apps.filter((a) => a.bursaryId !== pending.id),
      { bursaryId: pending.id, status: "Submitted", submittedAt: now, consentAt: now, referencesReceived: 1 },
    ]);
    setConsents([
      {
        id: `${pending.id}-${now}`,
        institution: pending.sponsor,
        fields: SHARED_FIELDS.map((f) => f.label),
        purpose: "Evaluate bursary application and confirm eligibility.",
        date: now,
      },
      ...consents,
    ]);
    toast.success(`Application submitted to ${pending.sponsor}`);
    setPending(null);
  }

  return (
    <AppShell title="Bursary Recommendations" subtitle="Matched to your marks, field, province and financial need">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input placeholder="Search bursaries, sponsors or fields…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Badge tone="cyan">{list.length} results</Badge>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {list.map(({ b, score }) => {
            const days = daysUntil(b.closing);
            const status = statusOf(b.id);
            return (
              <Card key={b.id} hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold">{b.name}</h3>
                    <p className="text-xs text-muted-foreground">{b.sponsor}</p>
                  </div>
                  <Badge tone={score >= 75 ? "cyan" : score >= 55 ? "gold" : "orange"}>{score}% match</Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Eligibility score</span>
                    <span>{Math.min(100, score + 3)}/100</span>
                  </div>
                  <Progress value={score} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-semibold">{b.amount}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-muted-foreground">Closing date</p>
                    <p className="font-semibold">
                      {b.closing} {days >= 0 ? `· ${days}d left` : "· closed"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs font-semibold text-muted-foreground">Qualification requirements</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {b.requirements.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="text-pink">•</span>
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {b.benefits.map((x) => (
                    <Badge key={x} tone="violet">
                      {x}
                    </Badge>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <Badge tone={status === "Submitted" ? "cyan" : "gold"}>{status}</Badge>
                  <Btn onClick={() => setPending(b)} disabled={status === "Submitted"}>
                    {status === "Submitted" ? "Consent given" : "Apply"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {pending && <ConsentModal sponsor={pending.sponsor} onCancel={() => setPending(null)} onConsent={confirmConsent} />}
    </AppShell>
  );
}
