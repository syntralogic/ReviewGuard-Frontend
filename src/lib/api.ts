import type {
  DashboardStats,
  GoogleConnection,
  Report,
  Review,
} from "@/types";

/**
 * Frontend-only service layer. Every function returns empty/null state today.
 * Swap these implementations for real API calls when the backend exists.
 */

export async function getGoogleConnection(): Promise<GoogleConnection> {
  return { connected: false, accountEmail: null, connectedAt: null };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    totalReviews: null,
    averageRating: null,
    needsAttention: null,
    reportsSubmitted: null,
  };
}

export async function getReviews(): Promise<Review[]> {
  return [];
}

export async function getReview(_id: string): Promise<Review | null> {
  return null;
}

export async function getReports(): Promise<Report[]> {
  return [];
}

export async function prepareReport(
  _input: Pick<Report, "reviewId" | "reason" | "explanation" | "evidence">,
): Promise<{ ok: true }> {
  return { ok: true };
}
