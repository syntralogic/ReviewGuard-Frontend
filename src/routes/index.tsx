import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plug, ShieldAlert, FileText } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getDashboardStats, getGoogleConnection } from "@/lib/api";

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
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function Dashboard() {
  const { data: connection } = useQuery({
    queryKey: ["google-connection"],
    queryFn: getGoogleConnection,
  });
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const show = (v: number | null | undefined) => (v === null || v === undefined ? "--" : String(v));

  return (
    <AppLayout>
      <PageHeader
        title="Review Dashboard"
        subtitle="Your Google Business Profile review overview."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={connection?.connected ? "success" : "neutral"}>
              {connection?.connected ? "Google connected" : "Not connected"}
            </Badge>
            <Button>
              <Plug className="h-4 w-4" />
              Connect Google
            </Button>
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
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Recent Reports</h2>
          <div className="mt-4">
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
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
