import type { AdminBusinessSummary, AdminPlatformStats, AdminReportSummary } from "@/types";
import { apiClient } from "@/lib/api-client";

/**
 * Admin panel data layer backed by the real ReviewGuard backend
 * (`syntralogic/ReviewGuard-Backend`, `/api/admin/*`) — replaces the old
 * localStorage mock (function names/shapes unchanged). These routes are
 * gated server-side by requireAdmin (role = 'admin' on the users table);
 * a signed-in user who isn't an admin will get a 403 from each call, which
 * the pages here already handle gracefully by falling back to empty/"--"
 * placeholder values rather than crashing. Nothing grants the admin role at
 * signup — see the backend's db/schema.sql for how to promote an account.
 */

export async function getAdminStats(): Promise<AdminPlatformStats> {
  return apiClient.get<AdminPlatformStats>("/api/admin/stats");
}

export async function getAdminBusinesses(): Promise<AdminBusinessSummary[]> {
  return apiClient.get<AdminBusinessSummary[]>("/api/admin/businesses");
}

export async function getAdminReports(): Promise<AdminReportSummary[]> {
  return apiClient.get<AdminReportSummary[]>("/api/admin/reports");
}
