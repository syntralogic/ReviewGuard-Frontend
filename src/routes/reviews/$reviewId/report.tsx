import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button, Card, PageHeader } from "@/components/ui/primitives";
import { prepareReport } from "@/lib/api";
import { POLICY_RISK_LABELS } from "@/types";

export const Route = createFileRoute("/reviews/$reviewId/report")({
  head: () => ({
    meta: [
      { title: "Report Review | ReviewGuard" },
      {
        name: "description",
        content: "Prepare a report explaining why a review may violate Google's policies.",
      },
      { property: "og:title", content: "Report Review | ReviewGuard" },
      {
        property: "og:description",
        content: "Prepare a report explaining why a review may violate Google's policies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportReview,
});

const fieldClass =
  "w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const REASONS = Object.entries(POLICY_RISK_LABELS) as [keyof typeof POLICY_RISK_LABELS, string][];

function ReportReview() {
  const { reviewId } = Route.useParams();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<keyof typeof POLICY_RISK_LABELS>("spam");
  const [explanation, setExplanation] = useState("");
  const [evidence, setEvidence] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await prepareReport({ reviewId, reason, explanation, evidence: evidence || null });
    queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
    queryClient.invalidateQueries({ queryKey: ["reports", reviewId] });
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    setDone(true);
  }

  return (
    <AppLayout>
      <Link
        to="/reviews/$reviewId"
        params={{ reviewId }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to review
      </Link>

      <PageHeader title="Report Review" subtitle="Prepare a report for this review." />

      <Card className="mt-6 max-w-2xl">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center animate-in fade-in">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <p className="text-base font-semibold">Report prepared</p>
            <p className="text-sm text-muted-foreground">
              Google reporting integration will be connected later.
            </p>
            <Link to="/reports" className="mt-2 w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Track Reports
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reason" className="text-sm font-medium">
                Policy concern
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as typeof reason)}
                className={`${fieldClass} mt-1.5 h-11`}
              >
                {REASONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="explanation" className="text-sm font-medium">
                Explanation
              </label>
              <textarea
                id="explanation"
                required
                rows={5}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why this review may violate Google's policies."
                className={`${fieldClass} mt-1.5 resize-y`}
              />
            </div>

            <div>
              <label htmlFor="evidence" className="text-sm font-medium">
                Evidence / notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="evidence"
                rows={4}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Add any supporting context."
                className={`${fieldClass} mt-1.5 resize-y`}
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto sm:self-start">
              Prepare Report
            </Button>
          </form>
        )}
      </Card>
    </AppLayout>
  );
}
