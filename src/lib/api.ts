import type { DashboardStats, GoogleConnection, Report, Review } from "@/types";

/**
 * Frontend-only mock data layer, backed by localStorage — same pattern as
 * lib/auth.ts. There is no backend yet; swap these implementations for real
 * API calls (and a real Google Business Profile + Google reporting
 * integration) once one exists. Nothing here talks to Google — "connecting"
 * only simulates importing a business's own existing reviews so the UI can
 * be exercised end-to-end, and "reporting" only prepares a report a person
 * can submit themselves through Google's own review-flagging tools; this
 * app never removes or alters a review on Google directly.
 */

const STORE_KEY = "reviewguard.store";

interface Store {
  connection: GoogleConnection;
  reviews: Review[];
  reports: Report[];
}

function seedReviews(): Review[] {
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

  return [
    {
      id: crypto.randomUUID(),
      businessId: "demo-business",
      reviewerName: "Aqsa R.",
      rating: 1,
      text: "Buy 500 followers instantly at cheapfollowers.example.com!! Best prices, DM me.",
      createdAt: daysAgo(2),
      riskCategories: ["spam", "promotional"],
      status: "needs_attention",
      notes: null,
      archived: false,
    },
    {
      id: crypto.randomUUID(),
      businessId: "demo-business",
      reviewerName: "Hamza K.",
      rating: 1,
      text: "Never even visited this place, just leaving 1 star because I don't like the owner personally.",
      createdAt: daysAgo(5),
      riskCategories: ["irrelevant", "conflict_of_interest"],
      status: "needs_attention",
      notes: null,
      archived: false,
    },
    {
      id: crypto.randomUUID(),
      businessId: "demo-business",
      reviewerName: "Sana M.",
      rating: 5,
      text: "Great service, friendly staff, and quick turnaround. Will come back again.",
      createdAt: daysAgo(7),
      riskCategories: [],
      status: "none",
      notes: null,
      archived: false,
    },
    {
      id: crypto.randomUUID(),
      businessId: "demo-business",
      reviewerName: "Bilal A.",
      rating: 2,
      text: "Service was slow and the staff seemed disorganized. Wouldn't recommend for a quick visit.",
      createdAt: daysAgo(10),
      riskCategories: [],
      status: "none",
      notes: null,
      archived: false,
    },
    {
      id: crypto.randomUUID(),
      businessId: "demo-business",
      reviewerName: "Unknown User",
      rating: 1,
      text: "You people are disgusting and should be ashamed, I hope your business fails, idiots.",
      createdAt: daysAgo(14),
      riskCategories: ["harassment", "offensive"],
      status: "resolved",
      notes: "Reported to Google in the past; review was taken down.",
      archived: false,
    },
  ];
}

function defaultStore(): Store {
  return {
    connection: { connected: false, accountEmail: null, connectedAt: null },
    reviews: [],
    reports: [],
  };
}

function readStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { ...defaultStore(), ...parsed };
  } catch {
    return defaultStore();
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// Simulate a small network delay so loading states are visible.
function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getGoogleConnection(): Promise<GoogleConnection> {
  return delay(readStore().connection);
}

/**
 * Simulates connecting a Google Business Profile. In a real integration this
 * would be an OAuth flow; here it just marks the account connected and
 * imports a starter set of reviews so the rest of the UI has data to show.
 */
export async function connectGoogleAccount(accountEmail: string): Promise<GoogleConnection> {
  const store = readStore();
  store.connection = { connected: true, accountEmail, connectedAt: new Date().toISOString() };
  if (store.reviews.length === 0) {
    store.reviews = seedReviews();
  }
  writeStore(store);
  return delay(store.connection);
}

export async function disconnectGoogleAccount(): Promise<GoogleConnection> {
  const store = readStore();
  store.connection = { connected: false, accountEmail: null, connectedAt: null };
  writeStore(store);
  return delay(store.connection);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { connection, reviews, reports } = readStore();
  if (!connection.connected) {
    return delay({
      totalReviews: null,
      averageRating: null,
      needsAttention: null,
      reportsSubmitted: null,
    });
  }

  const activeReviews = reviews.filter((r) => !r.archived);
  const totalReviews = activeReviews.length;
  const averageRating = totalReviews
    ? Math.round((activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;
  const needsAttention = activeReviews.filter((r) => r.status === "needs_attention").length;

  return delay({
    totalReviews,
    averageRating,
    needsAttention,
    reportsSubmitted: reports.length,
  });
}

export async function getReviews(): Promise<Review[]> {
  const { reviews } = readStore();
  return delay(
    reviews
      .filter((r) => !r.archived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  );
}

export async function getArchivedReviews(): Promise<Review[]> {
  const { reviews } = readStore();
  return delay(
    reviews
      .filter((r) => r.archived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  );
}

export async function getReview(id: string): Promise<Review | null> {
  const { reviews } = readStore();
  return delay(reviews.find((r) => r.id === id) ?? null);
}

export async function updateReviewNotes(id: string, notes: string): Promise<Review | null> {
  const store = readStore();
  const review = store.reviews.find((r) => r.id === id);
  if (!review) return delay(null);
  review.notes = notes.trim() || null;
  writeStore(store);
  return delay(review);
}

/**
 * Removes a review from this app's own list only (e.g. it isn't relevant, or
 * was actioned outside the app). This never touches the review on Google —
 * there is no way for a business to delete a Google review directly; only
 * Google can do that, and only after reviewing a report (see markReviewRemovedByGoogle).
 */
export async function archiveReview(id: string): Promise<Review | null> {
  const store = readStore();
  const review = store.reviews.find((r) => r.id === id);
  if (!review) return delay(null);
  review.archived = true;
  writeStore(store);
  return delay(review);
}

export async function unarchiveReview(id: string): Promise<Review | null> {
  const store = readStore();
  const review = store.reviews.find((r) => r.id === id);
  if (!review) return delay(null);
  review.archived = false;
  writeStore(store);
  return delay(review);
}

/**
 * Records that Google has actually taken a review down after a report was
 * submitted through Google's own tools. This is a manual confirmation the
 * business owner makes once they've checked their Google Business Profile —
 * the app has no way to detect or trigger this itself.
 */
export async function markReviewRemovedByGoogle(reviewId: string): Promise<Review | null> {
  const store = readStore();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) return delay(null);
  review.status = "resolved";
  const relatedReports = store.reports.filter((r) => r.reviewId === reviewId);
  relatedReports.forEach((r) => {
    r.status = "closed";
  });
  writeStore(store);
  return delay(review);
}

export async function getReports(): Promise<Report[]> {
  const { reports } = readStore();
  return delay(
    [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  );
}

export async function getReportsForReview(reviewId: string): Promise<Report[]> {
  const { reports } = readStore();
  return delay(reports.filter((r) => r.reviewId === reviewId));
}

/**
 * Prepares a report explaining why a review may violate Google's own review
 * policies. This only stores a draft locally for the business owner to
 * review and submit themselves through Google's official reporting/flagging
 * tools — it does not contact Google and cannot remove a review on its own.
 */
export async function prepareReport(
  input: Pick<Report, "reviewId" | "reason" | "explanation" | "evidence">,
): Promise<Report> {
  const store = readStore();
  const review = store.reviews.find((r) => r.id === input.reviewId);

  const report: Report = {
    id: crypto.randomUUID(),
    reviewId: input.reviewId,
    reviewExcerpt: review ? review.text.slice(0, 140) : "",
    reason: input.reason,
    explanation: input.explanation,
    evidence: input.evidence,
    createdAt: new Date().toISOString(),
    status: "prepared",
  };

  store.reports.push(report);
  if (review && review.status !== "resolved") {
    review.status = "reported";
  }
  writeStore(store);
  return delay(report);
}
