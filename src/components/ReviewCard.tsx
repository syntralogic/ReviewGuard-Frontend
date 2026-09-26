import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Badge, Button } from "@/components/ui/primitives";
import { POLICY_RISK_LABELS, type Review } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={
            i <= rating ? "h-3.5 w-3.5 fill-warning text-warning" : "h-3.5 w-3.5 text-muted-foreground"
          }
        />
      ))}
    </span>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="card-surface flex flex-col gap-3 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{review.reviewerName}</p>
          <div className="mt-1 flex items-center gap-2">
            <Stars rating={review.rating} />
            <span className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {review.status === "needs_attention" && <Badge tone="warning">Needs attention</Badge>}
          {review.status === "reported" && <Badge tone="accent">Reported</Badge>}
          {review.status === "resolved" && <Badge tone="success">Resolved</Badge>}
        </div>
      </div>

      <p className="line-clamp-3 text-sm text-muted-foreground">{review.text}</p>

      {review.riskCategories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {review.riskCategories.map((c) => (
            <Badge key={c} tone="neutral">
              {POLICY_RISK_LABELS[c]}
            </Badge>
          ))}
        </div>
      ) : null}

      <Link to="/reviews/$reviewId" params={{ reviewId: review.id }} className="w-full sm:w-auto">
        <Button variant="secondary" className="w-full sm:w-auto">
          View Details
        </Button>
      </Link>
    </article>
  );
}
