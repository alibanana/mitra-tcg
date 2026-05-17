"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/config/site"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { MobileHeaderNav } from "@/components/layout/mobile-header-nav"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    if (!isHome) {
      setAtTop(false)
      return
    }
    const check = () => setAtTop(window.scrollY < 10)
    check()
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [isHome])

  const transparent = isHome && atTop

  return (
    <header
      className="site-header sticky top-0 z-50 w-full transition-all duration-300"
      style={transparent ? { background: "transparent", borderBottomColor: "transparent" } : undefined}
    >
      <div className="site-header-inner container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center">
          {/* light mode / opaque header */}
          <Image
            src="/logo-light.png"
            alt={siteConfig.name}
            width={1080}
            height={1080}
            className={cn("h-20 w-auto", transparent ? "hidden" : "dark:hidden")}
            priority
          />
          {/* dark mode OR transparent-over-image */}
          <Image
            src="/logo-dark.png"
            alt={siteConfig.name}
            width={1080}
            height={1080}
            className={cn("h-20 w-auto", transparent ? "block" : "hidden dark:block")}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.marketing.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-base font-medium transition-colors",
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className={cn(
              "hidden rounded-full px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 md:inline-flex",
              transparent
                ? "border border-white/50 bg-white/15 text-white hover:bg-white/25"
                : "bg-primary text-primary-foreground",
            )}
          >
            Shop Now
          </Link>
          <ThemeToggle className={transparent ? "text-white hover:bg-white/20" : ""} />
          <MobileHeaderNav />
        </div>
      </div>
    </header>
  )
}
