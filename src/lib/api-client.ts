/**
 * Shared fetch wrapper for the ReviewGuard backend (see
 * `syntralogic/ReviewGuard-Backend`). Sends/receives the httpOnly session
 * cookie via `credentials: "include"`, and normalizes error responses
 * (`{ error: string }`) into thrown `Error`s so callers can keep using
 * try/catch the same way they did with the old localStorage mock.
 */

const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  // 204 No Content (e.g. logout) has no body to parse.
  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON response (e.g. a network/proxy error page) — fall through
    // and let the !res.ok branch below raise a generic error.
  }

  // The backend's "not found" routes (getReview, updateReviewNotes,
  // archive/unarchive, mark-removed, report submit) return 404 with a body
  // of exactly `null` rather than `{ error }` — resolve those to null
  // instead of throwing, matching how the old mock behaved for a missing id.
  if (res.status === 404 && body === null) {
    return null as T;
  }

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : "Something went wrong. Please try again.";
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", ...(data !== undefined ? { body: JSON.stringify(data) } : {}) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", ...(data !== undefined ? { body: JSON.stringify(data) } : {}) }),
};
