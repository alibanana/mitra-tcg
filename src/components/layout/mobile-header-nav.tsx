"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { siteConfig } from "@/config/site"
import { useState } from "react"

export function MobileHeaderNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-none border-2 border-foreground p-1.5 md:hidden">
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 rounded-none border-l-4 border-foreground p-0">
        <div className="flex h-14 items-center border-b-4 border-foreground px-6">
          <Link href="/" className="text-base font-bold uppercase tracking-wide" onClick={() => setOpen(false)}>
            {siteConfig.name}
          </Link>
        </div>
        <nav className="space-y-0 px-2 py-3">
          {siteConfig.nav.marketing.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
