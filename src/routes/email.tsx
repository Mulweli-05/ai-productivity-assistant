import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { AIDisclaimer, Btn, Card, Field, Input, SectionTitle, Select, Textarea } from "../components/ui-kit";
import { useAI } from "../lib/useAI";
import { emptyProfile, useLocalState, type StudentProfile } from "../lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Bursarie AI Assistant" },
      { name: "description", content: "Generate professional bursary inquiry, follow-up, appeal and thank-you emails in seconds." },
      { property: "og:title", content: "Smart Email Generator — Bursarie AI Assistant" },
      { property: "og:description", content: "AI-written bursary emails you can edit, copy and download." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

export function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function EmailPage() {
  const { value: profile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { run, loading, error } = useAI();
  const [type, setType] = useState("Bursary inquiry");
  const [tone, setTone] = useState("Formal");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");

  async function generate() {
    const res = await run(
      `Write a ${tone.toLowerCase()} "${type}" email.
Recipient/organisation: ${recipient || "the bursary office"}.
Student: ${profile.fullName || "a South African student"}, studying ${profile.fieldOfStudy || "their chosen field"} at ${profile.institution || "their institution"} (${profile.level}), province ${profile.province}, average ${profile.average || "not provided"}%.
Extra context: ${context || "none"}.
Return subject line then the email body. Keep it under 250 words.`,
      "You are an expert South African bursary application writing coach. Write clear, professional, human-sounding emails. Never invent qualifications or fake facts.",
    );
    if (res) {
      setOutput(res);
      toast.success("Email drafted");
    }
  }

  return (
    <AppShell title="Smart Email Generator" subtitle="Professional bursary correspondence, drafted by AI">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Email setup" />
          <div className="space-y-4">
            <Field label="Email type">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {["Bursary inquiry", "Follow-up", "Document submission", "Thank-you email", "Funding appeal"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tone">
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                {["Formal", "Friendly", "Persuasive"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Recipient / organisation">
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Sasol Bursary Office" />
            </Field>
            <Field label="Extra context">
              <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="I applied on 12 August and haven't received feedback…" />
            </Field>
            <Btn onClick={generate} loading={loading}>
              ✨ Generate email
            </Btn>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Your draft" desc="Fully editable before you send" />
          <Textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Your AI-generated email will appear here…"
            className="min-h-80"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(output);
                toast.success("Copied to clipboard");
              }}
              disabled={!output}
            >
              Copy
            </Btn>
            <Btn variant="warm" onClick={() => download("bursary-email.txt", output)} disabled={!output}>
              Download
            </Btn>
          </div>
          <AIDisclaimer />
        </Card>
      </div>
    </AppShell>
  );
}
