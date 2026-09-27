import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";
import { useAuth } from "@/contexts/auth-context";
import { getGoogleConnection } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile | ReviewGuard" },
      {
        name: "description",
        content:
          "Manage your ReviewGuard account, appearance, and Google Business Profile connection.",
      },
      { property: "og:title", content: "Profile | ReviewGuard" },
      {
        property: "og:description",
        content:
          "Manage your ReviewGuard account, appearance, and Google Business Profile connection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, logout } = useAuth();
  const { data: connection } = useQuery({
    queryKey: ["google-connection"],
    queryFn: getGoogleConnection,
  });

  return (
    <AppLayout>
      <PageHeader title="Profile" subtitle="Your account, appearance, and connections." />

      <div className="mt-6 flex flex-col gap-4 sm:max-w-md">
        <Card className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-base font-semibold uppercase text-secondary-foreground">
            {user?.name?.slice(0, 1) ?? "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </Card>

        <Card className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span>Google Business Profile</span>
          </div>
          <Badge tone={connection?.connected ? "success" : "neutral"}>
            {connection?.connected ? "Connected" : "Not connected"}
          </Badge>
        </Card>

        {connection?.connected && connection.accountEmail ? (
          <Card className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{connection.accountEmail}</span>
          </Card>
        ) : null}

        <Card className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Appearance</span>
          <ThemeToggle />
        </Card>

        <Button variant="secondary" className="w-full justify-center" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </AppLayout>
  );
}
