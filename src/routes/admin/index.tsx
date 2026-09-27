import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, ShieldAlert, FileText, Star } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getAdminBusinesses, getAdminReports, getAdminStats } from "@/lib/admin-api";
import { POLICY_RISK_LABELS } from "@/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin Overview | ReviewGuard" }],
  }),
  component: AdminOverview,
});

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function AdminOverview() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: getAdminStats });
  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: getAdminBusinesses,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: getAdminReports,
  });

  const recentBusinesses = businesses.slice(0, 3);
  const recentReports = reports.slice(0, 3);

  return (
    <AdminLayout>
      <PageHeader
        title="Admin Overview"
        subtitle="Platform-wide view across every business on ReviewGuard."
      />

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Businesses" value={String(stats?.totalBusinesses ?? "--")} />
        <StatCard label="Connected" value={String(stats?.connectedBusinesses ?? "--")} />
        <StatCard label="Total Reviews" value={String(stats?.totalReviews ?? "--")} />
        <StatCard label="Reports Submitted" value={String(stats?.totalReportsSubmitted ?? "--")} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Recently Added Businesses</h2>
          <div className="mt-4">
            {recentBusinesses.length === 0 ? (
              <EmptyState icon={<Building2 className="h-6 w-6" />} title="No businesses yet." />
            ) : (
              <ul className="flex flex-col gap-3">
                {recentBusinesses.map((b) => (
                  <li key={b.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{b.businessName}</span>
                      <Badge tone={b.connected ? "success" : "neutral"}>
                        {b.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {b.ownerName} · {b.ownerEmail}
                    </p>
                  </li>
                ))}
                <Link to="/admin/businesses" className="block text-sm font-medium text-primary">
                  View all businesses
                </Link>
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Recent Reports</h2>
          <div className="mt-4">
            {recentReports.length === 0 ? (
              <EmptyState icon={<FileText className="h-6 w-6" />} title="No reports yet." />
            ) : (
              <ul className="flex flex-col gap-3">
                {recentReports.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{r.businessName}</span>
                      <Badge tone="accent">{r.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {POLICY_RISK_LABELS[r.reason]} · {r.reviewExcerpt}
                    </p>
                  </li>
                ))}
                <Link to="/admin/reports" className="block text-sm font-medium text-primary">
                  View all reports
                </Link>
              </ul>
            )}
          </div>
        </Card>
      </section>

      {stats && stats.totalNeedsAttention > 0 ? (
        <section className="mt-6">
          <Card className="flex items-center gap-3 border-warning/30 bg-warning/5">
            <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm">
              <span className="font-semibold">{stats.totalNeedsAttention}</span> reviews across all
              businesses currently need attention.
            </p>
          </Card>
        </section>
      ) : null}

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5" /> Data shown here is placeholder/demo data — not yet
        connected to the real backend.
      </p>
    </AdminLayout>
  );
}
