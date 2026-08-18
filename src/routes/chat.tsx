import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Btn, Card, Input } from "../components/ui-kit";
import { useAI } from "../lib/useAI";
import { emptyProfile, useLocalState, type StudentProfile } from "../lib/store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Bursarie AI Assistant" },
      { name: "description", content: "Chat with an AI funding advisor about bursary requirements, applications and funding tips." },
      { property: "og:title", content: "AI Chatbot — Bursarie AI Assistant" },
      { property: "og:description", content: "Instant answers about bursaries, eligibility and the application process." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const PROMPTS = [
  "Which bursaries suit a 68% average?",
  "What documents do I need for NSFAS?",
  "How do I write a motivational letter?",
  "Tips for a bursary interview",
];

function ChatPage() {
  const { value: profile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: messages, setValue: setMessages } = useLocalState<Msg[]>("bursarie.chat", []);
  const { run, loading, error } = useAI();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    const history = next.slice(-8).map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`).join("\n");
    const res = await run(
      `Student profile: ${profile.fullName || "unknown"}, ${profile.level}, ${profile.fieldOfStudy || "field not set"}, ${profile.institution || "institution not set"}, ${profile.province}, average ${profile.average || "n/a"}%, financial need ${profile.financialNeed}.\n\nConversation:\n${history}\n\nReply as the assistant.`,
      "You are Bursarie, a warm, encouraging South African bursary advisor. Give practical, accurate guidance in short paragraphs and bullet points. Remind students to verify details with official providers when relevant.",
    );
    if (res) setMessages([...next, { role: "assistant", content: res }]);
  }

  return (
    <AppShell title="AI Chatbot" subtitle="Your always-on bursary advisor">
      <Card className="flex h-[calc(100vh-11rem)] flex-col !p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md pt-10 text-center">
              <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl gradient-brand text-2xl">🤖</div>
              <p className="font-display text-lg font-bold">Hi! I'm Bursarie.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask me anything about bursaries, eligibility, documents or applications.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "gradient-brand text-primary-foreground rounded-br-md"
                    : "border border-border bg-secondary/30 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-3xl rounded-bl-md border border-border bg-secondary/30 px-4 py-4">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="size-2 animate-bounce rounded-full bg-pink"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about bursaries…" />
            <Btn type="submit" loading={loading}>
              Send
            </Btn>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground">
            AI responses may contain errors — verify with official bursary providers.
          </p>
        </div>
      </Card>
    </AppShell>
  );
}
