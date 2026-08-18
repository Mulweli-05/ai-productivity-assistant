import { Btn } from "./ui-kit";

export const SHARED_FIELDS = [
  { label: "Full Name", why: "Used to identify your application on the sponsor's system." },
  { label: "ID Number", why: "Required to verify citizenship and prevent duplicate applications." },
  { label: "Email Address", why: "Used by the sponsor to contact you about your application." },
  { label: "Academic Records", why: "Used to assess whether you meet the academic criteria." },
  { label: "Supporting Documents", why: "Used to confirm financial need and registration status." },
];

export function ConsentModal({
  sponsor,
  onCancel,
  onConsent,
}: {
  sponsor: string;
  onCancel: () => void;
  onConsent: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button aria-label="Cancel" className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Information sharing notice"
        className="glass relative w-full max-w-lg rounded-3xl p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <h2 className="font-display text-lg font-bold">🔒 Information Sharing Notice</h2>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Institution</p>
        <p className="font-semibold">{sponsor}</p>

        <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Information being shared</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {SHARED_FIELDS.map((f) => (
            <li key={f.label} className="flex items-start gap-2">
              <span className="text-cyan">✅</span>
              <span>
                {f.label}{" "}
                <span title={f.why} className="cursor-help text-[11px] text-cyan underline decoration-dotted">
                  Why is this information needed?
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Purpose</p>
        <p className="text-sm">Evaluate bursary application and confirm eligibility.</p>

        <p className="mt-4 rounded-2xl border border-border bg-secondary/30 p-3 text-[11px] text-muted-foreground">
          POPIA notice: your data is only shared with this institution after you consent. You can withdraw consent at
          any time in the Privacy Center.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Btn variant="outline" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn onClick={onConsent}>I Consent &amp; Submit</Btn>
        </div>
      </div>
    </div>
  );
}
