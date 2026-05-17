"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/features/auth/actions"
import { LayoutDashboard, Package, Tag, Settings, Mail, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Categories", href: "/dashboard/categories", icon: Tag },
  { title: "Contacts", href: "/dashboard/contacts", icon: Mail },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-r-4 border-foreground bg-sidebar md:flex md:flex-col">
      <div className="flex h-14 items-center border-b-4 border-sidebar-border px-5">
        <Link href="/" className="text-base font-bold uppercase tracking-wide text-sidebar-foreground">
          {siteConfig.name}
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all",
                isActive
                  ? "border-l-4 border-primary bg-primary/10 pl-[10px] text-foreground"
                  : "border-l-4 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t-2 border-sidebar-border p-2">
        <form
          action={async () => {
            await logoutAction()
          }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-xs font-bold uppercase tracking-wide text-muted-foreground"
            type="submit"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  )
}
