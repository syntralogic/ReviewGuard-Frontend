import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Flag, Star } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getReview } from "@/lib/api";
import { POLICY_RISK_LABELS, type PolicyRiskCategory } from "@/types";

export const Route = createFileRoute("/reviews/$reviewId/")({
  head: () => ({
    meta: [
      { title: "Review Details | ReviewGuard" },
      {
        name: "description",
        content: "Review details with potential policy risk indicators, notes, and evidence.",
      },
      { property: "og:title", content: "Review Details | ReviewGuard" },
      {
        property: "og:description",
        content: "Review details with potential policy risk indicators, notes, and evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewDetails,
});

const RISK_CATEGORIES: PolicyRiskCategory[] = [
  "spam",
  "irrelevant",
  "harassment",
  "offensive",
  "promotional",
  "conflict_of_interest",
];

function ReviewDetails() {
  const { reviewId } = Route.useParams();
  const { data: review } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: () => getReview(reviewId),
  });

  return (
    <AppLayout>
      <Link
        to="/reviews"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to reviews
      </Link>

      <PageHeader title="Review Details" />

      {!review ? (
        <Card className="mt-6">
          <EmptyState
            title="This review isn't available yet."
            description="Connect your Google Business Profile to load review details."
          />
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{review.reviewerName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={
                          i <= review.rating
                            ? "h-3.5 w-3.5 fill-warning text-warning"
                            : "h-3.5 w-3.5 text-muted-foreground"
                        }
                      />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <h2 className="text-sm font-semibold">Potential Policy Risk</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Potential indicators only. Google decides the outcome of any report.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {RISK_CATEGORIES.map((c) => (
                  <Badge key={c} tone={review.riskCategories.includes(c) ? "warning" : "neutral"}>
                    {POLICY_RISK_LABELS[c]}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold">Notes</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {review.notes ?? "No notes added yet."}
              </p>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold">Evidence</h2>
              <p className="mt-2 text-sm text-muted-foreground">No evidence attached yet.</p>
            </Card>

            <Link to="/reviews/$reviewId/report" params={{ reviewId }} className="block">
              <Button className="w-full">
                <Flag className="h-4 w-4" />
                Report Review
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
