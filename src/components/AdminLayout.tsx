import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, FileWarning, ArrowLeft, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/auth-context";

const adminNav = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Businesses", to: "/admin/businesses", icon: Building2 },
  { label: "Reports", to: "/admin/reports", icon: FileWarning },
] as const;

/**
 * Platform-wide admin panel — separate from the per-business AppLayout.
 * Reads from lib/admin-api.ts, which now calls the backend's /api/admin/*
 * routes. Not yet gated in the UI by a real admin role (any signed-in user
 * can open these pages) — the backend itself enforces role = 'admin' on
 * every request and returns 403 for anyone else, so the pages fall back to
 * empty/"--" placeholders in that case rather than showing platform data.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const isActive = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface px-3 py-5 md:flex">
          <div className="flex items-center gap-2 px-2 pb-6">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight">ReviewGuard</p>
              <p className="truncate text-xs font-medium text-muted-foreground">Admin</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.to)
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2 px-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold uppercase text-secondary-foreground">
                {user?.name?.slice(0, 1) ?? "?"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2">
              <ThemeToggle className="flex-1" />
              <Link
                to="/"
                aria-label="Back to app"
                title="Back to app"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:pl-64 md:pr-6 lg:max-w-6xl">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
