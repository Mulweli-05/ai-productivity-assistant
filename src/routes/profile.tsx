import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { Badge, Btn, Card, Field, Input, Progress, Ring, SectionTitle, Select } from "../components/ui-kit";
import {
  BURSARIES,
  REQUIRED_DOCS,
  emptyProfile,
  profileCompletion,
  useLocalState,
  type Application,
  type StudentProfile,
} from "../lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — Bursarie AI Assistant" },
      { name: "description", content: "Capture your academic records, institution, province and financial need to unlock accurate bursary matches." },
      { property: "og:title", content: "Student Profile — Bursarie AI Assistant" },
      { property: "og:description", content: "Build a complete student funding profile for better bursary matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

function ProfilePage() {
  const { value: profile, setValue: setProfile } = useLocalState<StudentProfile>("bursarie.profile", emptyProfile);
  const { value: apps } = useLocalState<Application[]>("bursarie.apps", []);
  const set = (k: keyof StudentProfile, v: string) => setProfile({ ...profile, [k]: v });
  const toggleDoc = (doc: string) =>
    setProfile({
      ...profile,
      documents: profile.documents.includes(doc)
        ? profile.documents.filter((d) => d !== doc)
        : [...profile.documents, doc],
    });

  return (
    <AppShell title="Student Profile" subtitle="Your details power every AI recommendation">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <SectionTitle title="Personal details" desc="Stored locally on your device until you consent to share" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={profile.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Thandi Mokoena" />
              </Field>
              <Field label="ID number" why="Sponsors use your ID to verify citizenship and prevent duplicate applications.">
                <Input value={profile.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="0000000000000" />
              </Field>
              <Field label="Email">
                <Input type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
              </Field>
              <Field label="Phone">
                <Input value={profile.phone} onChange={(e) => set("phone", e.target.value)} placeholder="071 234 5678" />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Academic records" desc="Used to calculate eligibility scores" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Study level">
                <Select value={profile.level} onChange={(e) => set("level", e.target.value)}>
                  {["High School", "University", "TVET", "Postgraduate"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Institution">
                <Input value={profile.institution} onChange={(e) => set("institution", e.target.value)} placeholder="University of Pretoria" />
              </Field>
              <Field label="Institution type">
                <Select value={profile.institutionType} onChange={(e) => set("institutionType", e.target.value)}>
                  {["Public University", "University of Technology", "TVET College", "Private College", "High School"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Field of study">
                <Input value={profile.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)} placeholder="Computer Science" />
              </Field>
              <Field label="Province">
                <Select value={profile.province} onChange={(e) => set("province", e.target.value)}>
                  {PROVINCES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Current average (%)" why="Your average is compared to each bursary's minimum academic requirement.">
                <Input value={profile.average} onChange={(e) => set("average", e.target.value)} placeholder="72" inputMode="numeric" />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Financial need" desc="Many bursaries are means tested" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Annual household income (R)" why="Means-tested bursaries such as NSFAS require household income to confirm eligibility.">
                <Input value={profile.householdIncome} onChange={(e) => set("householdIncome", e.target.value)} placeholder="180000" inputMode="numeric" />
              </Field>
              <Field label="Level of need">
                <Select value={profile.financialNeed} onChange={(e) => set("financialNeed", e.target.value)}>
                  {["Very High", "High", "Moderate", "Low"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Supporting documents" desc="Tick documents you already have ready" />
            <div className="grid gap-2 sm:grid-cols-2">
              {REQUIRED_DOCS.map((d) => {
                const on = profile.documents.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDoc(d)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-sm transition-all ${
                      on ? "border-cyan/50 bg-cyan/10" : "border-border bg-secondary/20 hover:bg-secondary/40"
                    }`}
                  >
                    <span>{on ? "✅" : "⬜"}</span>
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <Btn onClick={() => toast.success("Profile saved to this device")}>Save profile</Btn>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="flex flex-col items-center">
            <SectionTitle title="Completion" />
            <Ring value={profileCompletion(profile)} label="complete" />
            <div className="mt-4 w-full space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Documents ready</span>
                <span>
                  {profile.documents.length}/{REQUIRED_DOCS.length}
                </span>
              </div>
              <Progress value={(profile.documents.length / REQUIRED_DOCS.length) * 100} tone="warm" />
            </div>
          </Card>

          <Card>
            <SectionTitle title="Saved applications" />
            {apps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications saved yet.</p>
            ) : (
              <ul className="space-y-2">
                {apps.map((a) => (
                  <li key={a.bursaryId} className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-3 text-sm">
                    <span>{BURSARIES.find((b) => b.id === a.bursaryId)?.name ?? a.bursaryId}</span>
                    <Badge tone="cyan">{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
