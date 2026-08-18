import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { AIDisclaimer, Btn, Card, EmptyState, SectionTitle, Textarea } from "../components/ui-kit";
import { download } from "./email";
import { useAI } from "../lib/useAI";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Bursarie AI Assistant" },
      { name: "description", content: "Turn messy meeting notes into key decisions, action items, deadlines and important information." },
      { property: "og:title", content: "Meeting Notes Summarizer — Bursarie AI Assistant" },
      { property: "og:description", content: "Paste or upload notes and get a clean, downloadable bullet summary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { run, loading, error } = useAI();
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");

  async function summarize() {
    const res = await run(
      `Summarise these notes for a student managing bursary applications. Use exactly these markdown sections with bullet points: "Key Decisions", "Action Items", "Deadlines", "Important Information". If a section has nothing, write "None captured".\n\nNOTES:\n${notes}`,
      "You are a precise meeting-notes summariser. Never invent facts that are not in the notes.",
    );
    if (res) {
      setSummary(res);
      toast.success("Summary ready");
    }
  }

  return (
    <AppShell title="Meeting Notes Summarizer" subtitle="Decisions, actions and deadlines — extracted automatically">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Your notes" desc="Paste notes or upload a .txt file" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-72" placeholder="Met with the financial aid office…" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
              Upload .txt
              <input
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setNotes(await f.text());
                }}
              />
            </label>
            <Btn onClick={summarize} loading={loading} disabled={!notes.trim()}>
              ✨ Summarize
            </Btn>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </Card>

        <Card>
          <SectionTitle title="Summary" />
          {summary ? (
            <>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-secondary/20 p-4 text-sm">
                {summary}
              </pre>
              <div className="mt-3 flex gap-2">
                <Btn
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    toast.success("Copied");
                  }}
                >
                  Copy
                </Btn>
                <Btn variant="warm" onClick={() => download("notes-summary.txt", summary)}>
                  Download
                </Btn>
              </div>
              <AIDisclaimer />
            </>
          ) : (
            <EmptyState icon="📝" title="No summary yet" desc="Paste your notes on the left and let the AI extract the essentials." />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
