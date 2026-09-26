import { useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

/**
 * Wrap protected page components with this. Auth state lives in localStorage,
 * so it can only be checked on the client — while it's loading (or once we
 * know there's no user) we render nothing and kick off a redirect to /login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.navigate({ to: "/login" });
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
