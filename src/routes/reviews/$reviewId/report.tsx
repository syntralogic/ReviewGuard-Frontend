import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button, Card, PageHeader } from "@/components/ui/primitives";
import { markReportSubmitted, prepareReport } from "@/lib/api";
import { POLICY_RISK_LABELS } from "@/types";
import type { Report } from "@/types";

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
  const [report, setReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
    queryClient.invalidateQueries({ queryKey: ["reports", reviewId] });
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const created = await prepareReport({
      reviewId,
      reason,
      explanation,
      evidence: evidence || null,
    });
    invalidateAll();
    setReport(created);
  }

  function reportText() {
    if (!report) return "";
    return [
      `Policy concern: ${POLICY_RISK_LABELS[report.reason]}`,
      `Review: "${report.reviewExcerpt}"`,
      `Explanation: ${report.explanation}`,
      report.evidence ? `Evidence / notes: ${report.evidence}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(reportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked by the browser; the text is still
      // visible above for the person to select and copy manually.
    }
  }

  async function onMarkSubmitted() {
    if (!report) return;
    setSubmitting(true);
    const updated = await markReportSubmitted(report.id);
    invalidateAll();
    if (updated) setReport(updated);
    setSubmitting(false);
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
        {report ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center animate-in fade-in">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <p className="text-base font-semibold">Report prepared</p>
            <p className="max-w-md text-sm text-muted-foreground">
              This app can't file a report with Google directly — there's no way for a business to
              do that except through Google's own tools. Copy the text below and submit it there,
              then mark it as sent so your records stay accurate.
            </p>

            <div className="mt-2 w-full text-left">
              <textarea
                readOnly
                value={reportText()}
                rows={6}
                className="w-full resize-y rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={onCopy}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy report text"}
              </Button>
              <a
                href="https://support.google.com/business/answer/4596773"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                Open Google's flagging tool
              </a>
            </div>

            {report.status === "prepared" ? (
              <Button
                className="mt-1 w-full sm:w-auto"
                onClick={onMarkSubmitted}
                disabled={submitting}
              >
                {submitting ? "Updating…" : "Mark as submitted to Google"}
              </Button>
            ) : (
              <p className="mt-1 text-sm font-medium text-primary">Marked as submitted to Google</p>
            )}

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
