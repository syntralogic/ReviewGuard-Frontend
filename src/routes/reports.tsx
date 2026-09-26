import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getReports } from "@/lib/api";
import { POLICY_RISK_LABELS } from "@/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports | ReviewGuard" },
      {
        name: "description",
        content: "Track reports you have prepared for potentially policy-violating Google reviews.",
      },
      { property: "og:title", content: "Reports | ReviewGuard" },
      {
        property: "og:description",
        content: "Track reports you have prepared for potentially policy-violating Google reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: getReports });

  return (
    <AppLayout>
      <PageHeader title="Reports" subtitle="Track reports you have prepared." />

      <Card className="mt-6 p-4">
        {reports.length === 0 ? (
          <EmptyState title="No reports submitted yet." />
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto] gap-4 border-b border-border pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
              <span>Review</span>
              <span>Reason</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            <ul className="divide-y divide-border">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 py-3 sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"
                >
                  <span className="min-w-0 truncate text-sm">{r.reviewExcerpt}</span>
                  <span className="text-sm text-muted-foreground">
                    {POLICY_RISK_LABELS[r.reason]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <Badge tone="accent">{r.status.replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </AppLayout>
  );
}
