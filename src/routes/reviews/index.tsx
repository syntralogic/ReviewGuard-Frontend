import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plug, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ReviewCard } from "@/components/ReviewCard";
import { useAuth } from "@/contexts/auth-context";
import {
  getArchivedReviews,
  connectGoogleAccount,
  getGoogleConnection,
  getReviews,
} from "@/lib/api";

export const Route = createFileRoute("/reviews/")({
  head: () => ({
    meta: [
      { title: "Reviews | ReviewGuard" },
      {
        name: "description",
        content: "Search, filter, and monitor reviews from your connected Google Business Profile.",
      },
      { property: "og:title", content: "Reviews | ReviewGuard" },
      {
        property: "og:description",
        content: "Search, filter, and monitor reviews from your connected Google Business Profile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reviews,
});

const selectClass =
  "h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto";

function Reviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [status, setStatus] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const { data: connection } = useQuery({
    queryKey: ["google-connection"],
    queryFn: getGoogleConnection,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: getReviews,
    enabled: !!connection?.connected && !showArchived,
  });
  const { data: archivedReviews = [] } = useQuery({
    queryKey: ["archived-reviews"],
    queryFn: getArchivedReviews,
    enabled: !!connection?.connected && showArchived,
  });

  const connectMutation = useMutation({
    mutationFn: () => connectGoogleAccount(user?.email ?? "owner@example.com"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-connection"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const filtered = (showArchived ? archivedReviews : reviews).filter(
    (r) =>
      (query === "" ||
        r.text.toLowerCase().includes(query.toLowerCase()) ||
        r.reviewerName.toLowerCase().includes(query.toLowerCase())) &&
      (rating === "all" || r.rating === Number(rating)) &&
      (status === "all" || r.status === status),
  );

  return (
    <AppLayout>
      <PageHeader
        title="Reviews"
        subtitle="Monitor reviews from your connected Google Business Profile."
        actions={
          <Button
            variant={showArchived ? "primary" : "secondary"}
            onClick={() => setShowArchived((v) => !v)}
          >
            {showArchived ? "Show active reviews" : "Show removed from list"}
          </Button>
        }
      />

      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reviews"
              className="h-11 w-full rounded-lg border border-border bg-input pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className={selectClass}
            aria-label="Rating filter"
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClass}
            aria-label="Status filter"
          >
            <option value="all">All</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="reported">Reported</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </Card>

      <section className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          connection?.connected ? (
            <EmptyState
              title={
                showArchived
                  ? "No reviews removed from your list."
                  : "No reviews match your filters."
              }
            />
          ) : (
            <EmptyState
              title="No reviews available yet."
              description="Connect your Google Business Profile to start monitoring reviews."
              action={
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                >
                  <Plug className="h-4 w-4" />
                  {connectMutation.isPending ? "Connecting…" : "Connect Google"}
                </Button>
              }
            />
          )
        ) : (
          filtered.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </section>
    </AppLayout>
  );
}
