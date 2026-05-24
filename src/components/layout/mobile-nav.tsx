"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/features/auth/actions"
import { Menu, LayoutDashboard, Package, Tag, Settings, Mail, LogOut, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const baseItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Categories", href: "/dashboard/categories", icon: Tag },
  { title: "Contacts", href: "/dashboard/contacts", icon: Mail },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

const superAdminItems = [
  { title: "Users", href: "/dashboard/users", icon: Users },
]

export function MobileNav({ role }: { role?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navItems = role === "SUPER_ADMIN" ? [...baseItems, ...superAdminItems] : baseItems

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-none border-2 border-foreground p-1.5 hover:bg-accent hover:text-accent-foreground md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 rounded-none border-r-4 border-foreground p-0">
        <div className="flex h-14 items-center border-b-4 border-foreground px-6">
          <Link href="/" className="text-base font-bold uppercase tracking-wide" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
        </div>
        <nav className="space-y-0 px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="border-t-2 border-foreground p-3">
          <form action={async () => { await logoutAction() }}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-xs font-bold uppercase"
              type="submit"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
