/**
 * Auth layer backed by the real ReviewGuard backend
 * (`syntralogic/ReviewGuard-Backend`, `/api/auth/*`). Session state lives in
 * an httpOnly cookie the backend sets — nothing sensitive is kept in
 * localStorage anymore. Function names/shapes match the old mock so the
 * rest of the app (auth-context.tsx) didn't need to change its call sites.
 */
import { apiClient } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin";
}

/** Reads the current session from the backend, or null if not logged in. */
export async function getSession(): Promise<AuthUser | null> {
  try {
    return await apiClient.get<AuthUser>("/api/auth/me");
  } catch {
    return null;
  }
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  return apiClient.post<AuthUser>("/api/auth/signup", input);
}

export async function signIn(input: { email: string; password: string }): Promise<AuthUser> {
  return apiClient.post<AuthUser>("/api/auth/login", input);
}

export async function signOut(): Promise<void> {
  await apiClient.post<void>("/api/auth/logout");
}
