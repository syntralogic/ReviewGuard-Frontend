import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquare, FileText, ShieldCheck, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/auth-context";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Reviews", to: "/reviews", icon: MessageSquare },
  { label: "Reports", to: "/reports", icon: FileText },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface px-3 py-5 md:flex">
          <div className="flex items-center gap-2 px-2 pb-6">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="truncate text-base font-semibold tracking-tight">ReviewGuard</span>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
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
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:pb-10 md:pl-64 md:pr-6 lg:max-w-6xl">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-border bg-surface/95 backdrop-blur md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive(item.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </AuthGuard>
  );
}
