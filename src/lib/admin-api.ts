import type { AdminBusinessSummary, AdminPlatformStats, AdminReportSummary } from "@/types";

/**
 * Frontend-only mock data layer for the admin panel — same localStorage-backed
 * pattern as lib/api.ts and lib/auth.ts. There is no backend admin
 * integration yet; this seeds a fake platform-wide view (multiple businesses
 * across the SaaS) purely so the admin UI can be built and exercised on its
 * own. Swap these for real API calls once the backend admin endpoints are
 * wired up.
 */

const STORE_KEY = "reviewguard.admin-store";

interface AdminStore {
  businesses: AdminBusinessSummary[];
  reports: AdminReportSummary[];
}

function seedBusinesses(): AdminBusinessSummary[] {
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

  return [
    {
      id: "biz-1",
      businessName: "Karim's Auto Repair",
      ownerName: "Karim Sheikh",
      ownerEmail: "karim@example.com",
      connected: true,
      googleAccountEmail: "karimsautorepair@gmail.com",
      totalReviews: 42,
      needsAttention: 3,
      reportsSubmitted: 2,
      createdAt: daysAgo(60),
    },
    {
      id: "biz-2",
      businessName: "Sana's Bakery",
      ownerName: "Sana Malik",
      ownerEmail: "sana@example.com",
      connected: true,
      googleAccountEmail: "sanasbakery@gmail.com",
      totalReviews: 128,
      needsAttention: 1,
      reportsSubmitted: 5,
      createdAt: daysAgo(120),
    },
    {
      id: "biz-3",
      businessName: "Bilal Dental Clinic",
      ownerName: "Dr. Bilal Ahmed",
      ownerEmail: "bilal@example.com",
      connected: false,
      googleAccountEmail: null,
      totalReviews: 0,
      needsAttention: 0,
      reportsSubmitted: 0,
      createdAt: daysAgo(4),
    },
    {
      id: "biz-4",
      businessName: "Aqsa Fitness Studio",
      ownerName: "Aqsa Raza",
      ownerEmail: "aqsa@example.com",
      connected: true,
      googleAccountEmail: "aqsafitness@gmail.com",
      totalReviews: 76,
      needsAttention: 6,
      reportsSubmitted: 1,
      createdAt: daysAgo(30),
    },
    {
      id: "biz-5",
      businessName: "Hamza Electronics",
      ownerName: "Hamza Khan",
      ownerEmail: "hamza@example.com",
      connected: false,
      googleAccountEmail: null,
      totalReviews: 0,
      needsAttention: 0,
      reportsSubmitted: 0,
      createdAt: daysAgo(1),
    },
  ];
}

function seedReports(): AdminReportSummary[] {
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

  return [
    {
      id: "rpt-1",
      businessName: "Sana's Bakery",
      reviewExcerpt: "Buy 500 followers instantly at cheapfollowers.example.com!!",
      reason: "spam",
      status: "submitted",
      createdAt: daysAgo(3),
    },
    {
      id: "rpt-2",
      businessName: "Karim's Auto Repair",
      reviewExcerpt: "Never even visited this place, just leaving 1 star...",
      reason: "irrelevant",
      status: "prepared",
      createdAt: daysAgo(5),
    },
    {
      id: "rpt-3",
      businessName: "Aqsa Fitness Studio",
      reviewExcerpt: "You people are disgusting and should be ashamed...",
      reason: "harassment",
      status: "closed",
      createdAt: daysAgo(14),
    },
    {
      id: "rpt-4",
      businessName: "Sana's Bakery",
      reviewExcerpt: "This is clearly a fake review from a competitor...",
      reason: "conflict_of_interest",
      status: "under_review",
      createdAt: daysAgo(1),
    },
  ];
}

function defaultStore(): AdminStore {
  return { businesses: seedBusinesses(), reports: seedReports() };
}

function readStore(): AdminStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seeded = defaultStore();
      window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as AdminStore;
  } catch {
    return defaultStore();
  }
}

// Simulate a small network delay so loading states are visible.
function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getAdminStats(): Promise<AdminPlatformStats> {
  const { businesses } = readStore();
  return delay({
    totalBusinesses: businesses.length,
    connectedBusinesses: businesses.filter((b) => b.connected).length,
    totalReviews: businesses.reduce((sum, b) => sum + b.totalReviews, 0),
    totalNeedsAttention: businesses.reduce((sum, b) => sum + b.needsAttention, 0),
    totalReportsSubmitted: businesses.reduce((sum, b) => sum + b.reportsSubmitted, 0),
  });
}

export async function getAdminBusinesses(): Promise<AdminBusinessSummary[]> {
  const { businesses } = readStore();
  return delay(
    [...businesses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
}

export async function getAdminReports(): Promise<AdminReportSummary[]> {
  const { reports } = readStore();
  return delay(
    [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  );
}
