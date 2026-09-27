import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
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
import { getAdminBusinesses } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/businesses")({
  head: () => ({
    meta: [{ title: "Businesses | ReviewGuard Admin" }],
  }),
  component: AdminBusinesses,
});

function AdminBusinesses() {
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: getAdminBusinesses,
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Businesses"
        subtitle="Every business registered on ReviewGuard, and their connection status."
      />

      <div className="mt-6">
        <Card className="p-0">
          {!isLoading && businesses.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={<Building2 className="h-6 w-6" />} title="No businesses yet." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reviews</TableHead>
                  <TableHead className="text-right">Needs Attention</TableHead>
                  <TableHead className="text-right">Reports</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.businessName}</TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate">{b.ownerName}</p>
                        <p className="truncate text-xs text-muted-foreground">{b.ownerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={b.connected ? "success" : "neutral"}>
                        {b.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{b.totalReviews}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {b.needsAttention > 0 ? (
                        <Badge tone="warning">{b.needsAttention}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{b.reportsSubmitted}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString()}
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
