export interface Business {
  id: string;
  name: string;
  address: string | null;
  googlePlaceId: string | null;
}

export interface GoogleConnection {
  connected: boolean;
  accountEmail: string | null;
  connectedAt: string | null;
}

export type PolicyRiskCategory =
  | "spam"
  | "irrelevant"
  | "harassment"
  | "offensive"
  | "promotional"
  | "conflict_of_interest";

export type ReviewStatus = "needs_attention" | "reported" | "resolved" | "none";

export interface Review {
  id: string;
  businessId: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: string;
  riskCategories: PolicyRiskCategory[];
  status: ReviewStatus;
  notes: string | null;
}

export type ReportStatus = "prepared" | "submitted" | "under_review" | "closed";

export interface Report {
  id: string;
  reviewId: string;
  reviewExcerpt: string;
  reason: PolicyRiskCategory | "other";
  explanation: string;
  evidence: string | null;
  createdAt: string;
  status: ReportStatus;
}

export interface DashboardStats {
  totalReviews: number | null;
  averageRating: number | null;
  needsAttention: number | null;
  reportsSubmitted: number | null;
}

export const POLICY_RISK_LABELS: Record<PolicyRiskCategory | "other", string> = {
  spam: "Spam-like content",
  irrelevant: "Irrelevant content",
  harassment: "Harassment",
  offensive: "Offensive content",
  promotional: "Promotional content",
  conflict_of_interest: "Conflict of interest",
  other: "Other",
};
