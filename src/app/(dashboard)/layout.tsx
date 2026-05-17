import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

function AvatarInitials({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (email?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary text-xs font-bold text-primary-foreground">
      {initials}
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b-4 border-foreground bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground md:hidden">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2.5">
              <AvatarInitials
                name={session.user.name}
                email={session.user.email}
              />
              <span className="hidden text-xs text-muted-foreground sm:block">
                {session.user.email}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
