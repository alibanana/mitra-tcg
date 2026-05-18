"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { CategoryWithChildren } from "@/features/categories/types"
import { cn } from "@/lib/utils"

interface NavProductsDropdownProps {
  categories: CategoryWithChildren[]
  overHero: boolean
}

export function NavProductsDropdown({ categories, overHero }: NavProductsDropdownProps) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const enter = () => { clearTimeout(timer.current); setOpen(true) }
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 150) }

  const baseClass = cn(
    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 inline-flex items-center gap-1",
    overHero
      ? "text-white/85 hover:text-white hover:bg-white/15"
      : "text-foreground/85 hover:text-foreground hover:bg-foreground/8",
    open && (overHero ? "text-white bg-white/15" : "text-foreground bg-foreground/8"),
  )

  if (categories.length === 0) {
    return (
      <Link href="/products" className={baseClass}>
        Products
      </Link>
    )
  }

  return (
    <div className="relative">
      <Link
        href="/products"
        className={baseClass}
        onMouseEnter={enter}
        onMouseLeave={leave}
      >
        Products
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </Link>

      <div
        aria-hidden={!open}
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 transition-all duration-200",
          open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1",
        )}
        onMouseEnter={enter}
        onMouseLeave={leave}
      >
        <div className={cn(
          "min-w-52 rounded-2xl border py-2 shadow-xl backdrop-blur-md",
          overHero
            ? "border-white/20 bg-black/60"
            : "border-border/30 bg-background/95",
        )}>
          <Link
            href="/products"
            className={cn(
              "block px-4 py-2 text-sm transition-colors",
              overHero
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            All Products
          </Link>
          <div className={cn("my-1.5 border-t", overHero ? "border-white/10" : "border-border/30")} />
          {categories.map((cat) => (
            <div key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}`}
                className={cn(
                  "block px-4 py-2 text-sm font-medium transition-colors",
                  overHero
                    ? "text-white/85 hover:text-white hover:bg-white/10"
                    : "text-foreground/85 hover:text-foreground hover:bg-muted/50",
                )}
              >
                {cat.name}
              </Link>
              {cat.children?.map((child) => (
                <div key={child.id}>
                  <Link
                    href={`/products?category=${child.slug}`}
                    className={cn(
                      "block pl-7 pr-4 py-1.5 text-xs transition-colors",
                      overHero
                        ? "text-white/60 hover:text-white hover:bg-white/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    {child.name}
                  </Link>
                  {child.children?.map((grandchild) => (
                    <Link
                      key={grandchild.id}
                      href={`/products?category=${grandchild.slug}`}
                      className={cn(
                        "block pl-11 pr-4 py-1 text-xs transition-colors",
                        overHero
                          ? "text-white/50 hover:text-white hover:bg-white/10"
                          : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      {grandchild.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
