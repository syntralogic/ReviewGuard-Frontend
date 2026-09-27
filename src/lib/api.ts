import type { DashboardStats, GoogleConnection, Report, Review } from "@/types";
import { apiClient } from "@/lib/api-client";

/**
 * Data layer backed by the real ReviewGuard backend
 * (`syntralogic/ReviewGuard-Backend`, `/api/*`) — replaces the old
 * localStorage mock. Function names/shapes are unchanged so route/component
 * call sites didn't need to change. Nothing here talks to Google —
 * "connecting" only simulates importing a business's own existing reviews
 * (same as the backend's seed data) so the UI can be exercised end-to-end,
 * and "reporting" only prepares a report a person can submit themselves
 * through Google's own review-flagging tools; this app never removes or
 * alters a review on Google directly.
 */

export async function getGoogleConnection(): Promise<GoogleConnection> {
  return apiClient.get<GoogleConnection>("/api/connection");
}

/**
 * Simulates connecting a Google Business Profile. In a real integration this
 * would be an OAuth flow; here the backend just marks the account connected
 * and imports a starter set of reviews so the rest of the UI has data to
 * show the first time.
 */
export async function connectGoogleAccount(accountEmail: string): Promise<GoogleConnection> {
  return apiClient.post<GoogleConnection>("/api/connection/connect", { accountEmail });
}

export async function disconnectGoogleAccount(): Promise<GoogleConnection> {
  return apiClient.post<GoogleConnection>("/api/connection/disconnect");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>("/api/dashboard/stats");
}

export async function getReviews(): Promise<Review[]> {
  return apiClient.get<Review[]>("/api/reviews");
}

export async function getArchivedReviews(): Promise<Review[]> {
  return apiClient.get<Review[]>("/api/reviews/archived");
}

export async function getReview(id: string): Promise<Review | null> {
  return apiClient.get<Review | null>(`/api/reviews/${id}`);
}

export async function updateReviewNotes(id: string, notes: string): Promise<Review | null> {
  return apiClient.patch<Review | null>(`/api/reviews/${id}/notes`, { notes });
}

/**
 * Removes a review from this app's own list only (e.g. it isn't relevant, or
 * was actioned outside the app). This never touches the review on Google —
 * there is no way for a business to delete a Google review directly; only
 * Google can do that, and only after reviewing a report (see markReviewRemovedByGoogle).
 */
export async function archiveReview(id: string): Promise<Review | null> {
  return apiClient.post<Review | null>(`/api/reviews/${id}/archive`);
}

export async function unarchiveReview(id: string): Promise<Review | null> {
  return apiClient.post<Review | null>(`/api/reviews/${id}/unarchive`);
}

/**
 * Records that Google has actually taken a review down after a report was
 * submitted through Google's own tools. This is a manual confirmation the
 * business owner makes once they've checked their Google Business Profile —
 * the app has no way to detect or trigger this itself.
 */
export async function markReviewRemovedByGoogle(reviewId: string): Promise<Review | null> {
  return apiClient.post<Review | null>(`/api/reviews/${reviewId}/mark-removed`);
}

export async function getReports(): Promise<Report[]> {
  return apiClient.get<Report[]>("/api/reports");
}

export async function getReportsForReview(reviewId: string): Promise<Report[]> {
  return apiClient.get<Report[]>(`/api/reports/review/${reviewId}`);
}

/**
 * Marks a prepared report as actually submitted through Google's own
 * review-flagging tools. This is a manual confirmation the business owner
 * makes once they've copied the report and filed it with Google themselves —
 * the app has no way to submit it on their behalf, so without this the
 * report would stay "prepared" forever even after it was sent.
 */
export async function markReportSubmitted(id: string): Promise<Report | null> {
  return apiClient.post<Report | null>(`/api/reports/${id}/submit`);
}

/**
 * Prepares a report explaining why a review may violate Google's own review
 * policies. This only stores a draft for the business owner to review and
 * submit themselves through Google's official reporting/flagging tools — it
 * does not contact Google and cannot remove a review on its own.
 */
export async function prepareReport(
  input: Pick<Report, "reviewId" | "reason" | "explanation" | "evidence">,
): Promise<Report> {
  return apiClient.post<Report>("/api/reports", input);
}
