import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { AIDisclaimer, Badge, Btn, Card, EmptyState, Input, Progress, SectionTitle, Select } from "../components/ui-kit";
import { useAI } from "../lib/useAI";
import { BURSARIES, daysUntil, useLocalState, type Task } from "../lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Bursarie AI Assistant" },
      { name: "description", content: "Generate daily and weekly application schedules with prioritised, deadline-aware tasks." },
      { property: "og:title", content: "AI Task Planner — Bursarie AI Assistant" },
      { property: "og:description", content: "Prioritised study and bursary application plans with completion tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { value: tasks, setValue: setTasks } = useLocalState<Task[]>("bursarie.tasks", []);
  const { run, loading, error } = useAI();
  const [mode, setMode] = useState("Weekly plan");
  const [plan, setPlan] = useState("");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Important");

  const done = tasks.filter((t) => t.done).length;

  async function generate() {
    const deadlines = BURSARIES.map((b) => `${b.name} closes ${b.closing} (${daysUntil(b.closing)} days)`).join("; ");
    const res = await run(
      `Create a ${mode.toLowerCase()} for a South African student applying for bursaries. Group tasks under Urgent, Important and Upcoming. Include time blocks and keep it actionable. Known deadlines: ${deadlines}. Current open tasks: ${tasks.filter((t) => !t.done).map((t) => t.title).join(", ") || "none"}.`,
      "You are an expert productivity coach for students. Be concrete, time-boxed and realistic.",
    );
    if (res) setPlan(res);
  }

  function addTask() {
    if (!title.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), title, due: due || new Date().toISOString().slice(0, 10), priority, done: false }]);
    setTitle("");
    setDue("");
    toast.success("Task added");
  }

  const byDate = [...tasks].sort((a, b) => a.due.localeCompare(b.due));

  return (
    <AppShell title="AI Planner" subtitle="Daily and weekly plans that respect your deadlines">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Generate a plan" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              {["Daily plan", "Weekly plan", "Application schedule"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
            <Btn onClick={generate} loading={loading}>
              ✨ Generate
            </Btn>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {plan ? (
            <>
              <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-secondary/20 p-4 text-sm">
                {plan}
              </pre>
              <AIDisclaimer />
            </>
          ) : (
            <div className="mt-4">
              <EmptyState icon="📅" title="No plan yet" desc="Pick a plan type and let the AI build your schedule." />
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="Add a task" />
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Certify ID copy" />
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
                {["Urgent", "Important", "Normal"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <Btn variant="outline" onClick={addTask} className="w-full">
                Add task
              </Btn>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Task completion" />
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {done}/{tasks.length} complete
              </span>
              <Badge tone="cyan">{tasks.length ? Math.round((done / tasks.length) * 100) : 0}%</Badge>
            </div>
            <Progress value={tasks.length ? (done / tasks.length) * 100 : 0} />
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <SectionTitle title="Calendar view" desc="Tasks ordered by due date" />
          {byDate.length === 0 ? (
            <EmptyState icon="🗓️" title="Your calendar is empty" desc="Add tasks to see them laid out by due date." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {byDate.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                  className={`rounded-2xl border p-4 text-left transition-all card-hover ${
                    t.done ? "border-cyan/40 bg-cyan/10" : "border-border bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={t.priority === "Urgent" ? "pink" : t.priority === "Important" ? "gold" : "violet"}>
                      {t.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{t.due}</span>
                  </div>
                  <p className={`mt-2 text-sm ${t.done ? "line-through opacity-70" : ""}`}>{t.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{t.done ? "✅ Completed" : "Tap to complete"}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
