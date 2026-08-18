import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { Badge, Btn, Card, Field, SectionTitle, Select } from "../components/ui-kit";
import { useLocalState } from "../lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Bursarie AI Assistant" },
      { name: "description", content: "Manage notifications, accessibility, reminders and local data preferences for your funding assistant." },
      { property: "og:title", content: "Settings — Bursarie AI Assistant" },
      { property: "og:description", content: "Personalise reminders, accessibility and AI preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

type Prefs = {
  reminderDays: string;
  emailTone: string;
  reduceMotion: boolean;
  largeText: boolean;
  deadlineAlerts: boolean;
  aiTips: boolean;
};

const defaults: Prefs = {
  reminderDays: "14",
  emailTone: "Formal",
  reduceMotion: false,
  largeText: false,
  deadlineAlerts: true,
  aiTips: true,
};

function Toggle({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/20 p-4 text-left transition-colors hover:bg-secondary/40"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "gradient-brand" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-foreground transition-all ${on ? "left-5.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function SettingsPage() {
  const { value: prefs, setValue: setPrefs } = useLocalState<Prefs>("bursarie.prefs", defaults);
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs({ ...prefs, [k]: v });

  return (
    <AppShell title="Settings" subtitle="Personalise your Bursarie experience">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Reminders" />
          <div className="space-y-4">
            <Field label="Remind me before a deadline">
              <Select value={prefs.reminderDays} onChange={(e) => set("reminderDays", e.target.value)}>
                {["3", "7", "14", "30"].map((d) => (
                  <option key={d} value={d}>
                    {d} days before
                  </option>
                ))}
              </Select>
            </Field>
            <Toggle
              on={prefs.deadlineAlerts}
              onChange={(v) => set("deadlineAlerts", v)}
              label="Deadline alerts"
              desc="Show reminders in the notifications panel"
            />
            <Toggle on={prefs.aiTips} onChange={(v) => set("aiTips", v)} label="AI tips" desc="Occasional application tips from the assistant" />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Accessibility & appearance" />
          <div className="space-y-4">
            <Toggle on={prefs.reduceMotion} onChange={(v) => set("reduceMotion", v)} label="Reduce motion" desc="Minimise hover and transition animations" />
            <Toggle on={prefs.largeText} onChange={(v) => set("largeText", v)} label="Larger text" desc="Increase base font size for readability" />
            <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm">
              Theme <Badge tone="violet">Vibrant dark</Badge>
              <p className="mt-1 text-xs text-muted-foreground">Bursarie is designed dark-first for comfortable late-night studying.</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="AI defaults" />
          <Field label="Default email tone">
            <Select value={prefs.emailTone} onChange={(e) => set("emailTone", e.target.value)}>
              {["Formal", "Friendly", "Persuasive"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <div className="mt-4">
            <Btn onClick={() => toast.success("Preferences saved")}>Save preferences</Btn>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Local data" desc="Everything is stored on this device" />
          <Btn
            variant="outline"
            onClick={() => {
              Object.keys(localStorage)
                .filter((k) => k.startsWith("bursarie."))
                .forEach((k) => localStorage.removeItem(k));
              toast.success("Local data cleared — reload to see changes");
            }}
          >
            Clear all local data
          </Btn>
        </Card>
      </div>
    </AppShell>
  );
}
