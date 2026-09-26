import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plug, ShieldAlert, FileText, Star } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { useAuth } from "@/contexts/auth-context";
import {
  connectGoogleAccount,
  disconnectGoogleAccount,
  getDashboardStats,
  getGoogleConnection,
  getReports,
  getReviews,
} from "@/lib/api";
import { POLICY_RISK_LABELS } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Review Dashboard | ReviewGuard" },
      {
        name: "description",
        content:
          "Monitor your Google reviews, spot potential policy risks, and track prepared reports in one dashboard.",
      },
      { property: "og:title", content: "Review Dashboard | ReviewGuard" },
      {
        property: "og:description",
        content:
          "Monitor your Google reviews, spot potential policy risks, and track prepared reports in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: connection } = useQuery({
    queryKey: ["google-connection"],
    queryFn: getGoogleConnection,
  });
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    enabled: !!connection,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: getReviews,
    enabled: !!connection?.connected,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
    enabled: !!connection?.connected,
  });

  const connectMutation = useMutation({
    mutationFn: () => connectGoogleAccount(user?.email ?? "owner@example.com"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-connection"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogleAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-connection"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const show = (v: number | null | undefined) => (v === null || v === undefined ? "--" : String(v));
  const attentionReviews = reviews.filter((r) => r.status === "needs_attention").slice(0, 3);

  return (
    <AppLayout>
      <PageHeader
        title="Review Dashboard"
        subtitle="Your Google Business Profile review overview."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={connection?.connected ? "success" : "neutral"}>
              {connection?.connected ? `Connected · ${connection.accountEmail}` : "Not connected"}
            </Badge>
            {connection?.connected ? (
              <Button variant="secondary" onClick={() => disconnectMutation.mutate()}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>
                <Plug className="h-4 w-4" />
                {connectMutation.isPending ? "Connecting…" : "Connect Google"}
              </Button>
            )}
          </div>
        }
      />

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Reviews" value={show(stats?.totalReviews)} />
        <StatCard label="Average Rating" value={show(stats?.averageRating)} />
        <StatCard label="Needs Attention" value={show(stats?.needsAttention)} />
        <StatCard label="Reports Submitted" value={show(stats?.reportsSubmitted)} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Reviews Requiring Attention</h2>
          <div className="mt-4">
            {!connection?.connected ? (
              <EmptyState
                icon={<ShieldAlert className="h-6 w-6" />}
                title="Connect Google to see flagged reviews."
              />
            ) : attentionReviews.length === 0 ? (
              <EmptyState
                icon={<ShieldAlert className="h-6 w-6" />}
                title="No reviews requiring attention yet."
                action={
                  <Link to="/reviews" className="block">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      View Reviews
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {attentionReviews.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/reviews/$reviewId"
                      params={{ reviewId: r.id }}
                      className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{r.reviewerName}</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={
                                i <= r.rating
                                  ? "h-3 w-3 fill-warning text-warning"
                                  : "h-3 w-3 text-muted-foreground"
                              }
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.text}</p>
                    </Link>
                  </li>
                ))}
                <Link to="/reviews" className="block">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    View all reviews
                  </Button>
                </Link>
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Recent Reports</h2>
          <div className="mt-4">
            {reports.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No reports submitted yet."
                action={
                  <Link to="/reports" className="block">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      View Reports
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {reports.slice(0, 3).map((r) => (
                  <li key={r.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{r.reviewExcerpt}</span>
                      <Badge tone="accent">{r.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {POLICY_RISK_LABELS[r.reason]} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
                <Link to="/reports" className="block">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    View all reports
                  </Button>
                </Link>
              </ul>
            )}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
