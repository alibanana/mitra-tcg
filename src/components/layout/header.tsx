"use client";

import { MobileHeaderNav } from "@/components/layout/mobile-header-nav";
import { NavProductsDropdown } from "@/components/layout/nav-products-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/config/site";
import type { CategoryWithChildren } from "@/features/categories/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  categories?: CategoryWithChildren[];
}

export function Header({ categories = [] }: HeaderProps) {
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(true);

  // Only the home page has a hero section. Derive the initial state from the
  // pathname so there is no DOM-timing race with client-component pages.
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setOverHero(false);
      return;
    }

    const check = () => {
      const hero = document.querySelector<HTMLElement>(".site-hero");
      if (!hero) {
        setOverHero(false);
        return;
      }
      setOverHero(hero.getBoundingClientRect().bottom > 80);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [isHomePage]);

  return (
    <header className="site-header sticky top-0 z-50 w-full overflow-visible">
      <div className="container mx-auto flex h-20 items-center justify-between overflow-visible pl-2 pr-6 lg:px-12">
        {/* Logo — white version over hero, theme-aware once scrolled past */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-light.png"
            alt={siteConfig.name}
            width={1080}
            height={1080}
            className={cn(
              "h-20 w-auto mt-2 md:h-24 transition-opacity duration-300",
              overHero ? "hidden" : "dark:hidden",
            )}
            priority
          />
          <Image
            src="/logo-dark.png"
            alt={siteConfig.name}
            width={1080}
            height={1080}
            className={cn(
              "h-20 w-auto mt-2 md:h-24 transition-opacity duration-300",
              overHero ? "block" : "hidden dark:block",
            )}
            priority
          />
        </Link>

        {/* Nav pill */}
        <nav
          className={cn(
            "hidden md:flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-md transition-all duration-500",
            overHero
              ? "border-white/20 bg-white/10"
              : "border-border/25 bg-background/55",
          )}
        >
          {siteConfig.nav.marketing.map((item) =>
            item.href === "/products" ? (
              <NavProductsDropdown
                key={item.href}
                categories={categories}
                overHero={overHero}
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                  overHero
                    ? "text-white/85 hover:text-white hover:bg-white/15"
                    : "text-foreground/85 hover:text-foreground hover:bg-foreground/8",
                )}
              >
                {item.title}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Shop Now */}
          <Link
            href="/products"
            className={cn(
              "hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-500 md:inline-flex",
              overHero
                ? "border border-white/50 bg-white/15 text-white hover:bg-white/25"
                : "border border-foreground/25 text-foreground hover:bg-foreground/10",
            )}
          >
            Shop Now
          </Link>
          {/* Theme toggle — icon reflects actual theme, colour forced white over hero */}
          <ThemeToggle
            className={cn(
              "transition-colors duration-300",
              overHero && "text-white hover:bg-white/20",
            )}
          />
          <MobileHeaderNav
            categories={categories}
            className={cn(
              overHero && "border-white/50 text-white hover:bg-white/20",
            )}
          />
        </div>
      </div>
    </header>
  );
}
