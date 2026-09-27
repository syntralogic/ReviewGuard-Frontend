import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminReports } from "@/lib/admin-api";
import { POLICY_RISK_LABELS, type ReportStatus } from "@/types";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [{ title: "Reports | ReviewGuard Admin" }],
  }),
  component: AdminReports,
});

const statusTone: Record<ReportStatus, "neutral" | "warning" | "success" | "accent"> = {
  prepared: "neutral",
  submitted: "accent",
  under_review: "warning",
  closed: "success",
};

function AdminReports() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: getAdminReports,
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Reports"
        subtitle="Every policy-violation report prepared or submitted across all businesses."
      />

      <div className="mt-6">
        <Card className="p-0">
          {!isLoading && reports.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={<FileText className="h-6 w-6" />} title="No reports yet." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Review Excerpt</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.businessName}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-1 text-muted-foreground">{r.reviewExcerpt}</p>
                    </TableCell>
                    <TableCell>{POLICY_RISK_LABELS[r.reason]}</TableCell>
                    <TableCell>
                      <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
