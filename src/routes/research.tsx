import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { AIDisclaimer, Btn, Card, EmptyState, Input, SectionTitle } from "../components/ui-kit";
import { useAI } from "../lib/useAI";
import { download } from "./email";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Bursarie AI Assistant" },
      { name: "description", content: "Research bursaries and careers with AI summaries of eligibility, benefits and funding insights." },
      { property: "og:title", content: "AI Research Assistant — Bursarie AI Assistant" },
      { property: "og:description", content: "Ask about any bursary, career or funding topic and get a structured summary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const SUGGESTIONS = [
  "How does NSFAS decide who qualifies?",
  "Best bursaries for engineering students in 2026",
  "What careers does a BCom Accounting open up?",
  "How do I appeal a rejected bursary application?",
];

function ResearchPage() {
  const { run, loading, error } = useAI();
  const [q, setQ] = useState("");
  const [result, setResult] = useState("");

  async function search(topic: string) {
    setQ(topic);
    const res = await run(
      `Research topic: "${topic}". Respond with markdown sections: Summary, Eligibility Requirements, Key Benefits, Recommendations, Funding Insights. Focus on the South African student funding context. Flag anything the student must verify with the official provider.`,
      "You are a South African student funding research analyst. Be factual, structured and cautious about uncertain details.",
    );
    if (res) setResult(res);
  }

  return (
    <AppShell title="AI Research Assistant" subtitle="Bursary, career and funding research in seconds">
      <div className="space-y-4">
        <Card>
          <SectionTitle title="What do you want to research?" />
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) search(q);
            }}
          >
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Funza Lushaka priority subjects" />
            <Btn type="submit" loading={loading} disabled={!q.trim()}>
              🔍 Research
            </Btn>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => search(s)}
                className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </Card>

        <Card>
          <SectionTitle title="Findings" />
          {result ? (
            <>
              <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-secondary/20 p-4 text-sm">{result}</pre>
              <div className="mt-3">
                <Btn variant="warm" onClick={() => download("research-summary.txt", result)}>
                  Download summary
                </Btn>
              </div>
              <AIDisclaimer />
            </>
          ) : (
            <EmptyState icon="🔍" title="Nothing researched yet" desc="Ask a question or pick a suggested topic to get started." />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
