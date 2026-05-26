"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import type { CategoryWithChildren } from "@/features/categories/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MobileHeaderNavProps {
  className?: string;
  categories?: CategoryWithChildren[];
}

const DEPTH_PADDING = ["px-6", "pl-9", "pl-12", "pl-14"] as const;

function CategoryItem({
  category,
  depth,
  onNavigate,
  pathname,
}: {
  category: CategoryWithChildren;
  depth: number;
  onNavigate: () => void;
  pathname: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const pl = DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)];
  const rowClassName = cn(
    "flex w-full items-center justify-between py-2.5 text-sm transition-colors hover:bg-muted hover:text-foreground",
    pl,
    depth === 0
      ? "font-semibold uppercase tracking-wide text-foreground"
      : "text-muted-foreground",
  );

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(rowClassName, "pr-3")}
          aria-label={expanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
        >
          {category.name}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      ) : (
        <Link
          href={`/products?category=${category.slug}`}
          onClick={onNavigate}
          className={cn(rowClassName, "pr-3")}
        >
          {category.name}
        </Link>
      )}
      {expanded && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              onNavigate={onNavigate}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsMobileItem({
  categories,
  pathname,
  onNavigate,
}: {
  categories: CategoryWithChildren[];
  pathname: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive =
    pathname === "/products" || pathname.startsWith("/products/");

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-base font-semibold uppercase tracking-wide transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        Products
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && (
        <div className="border-t border-foreground/10 bg-muted/30 py-1">
          <Link
            href="/products"
            onClick={onNavigate}
            className={cn(
              "block px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground",
              pathname === "/products" ? "text-primary" : "text-muted-foreground",
            )}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              depth={0}
              onNavigate={onNavigate}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileHeaderNav({
  className,
  categories = [],
}: MobileHeaderNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-none border-2 border-foreground p-2.5 md:hidden transition-colors duration-300",
          className,
        )}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-64 rounded-none border-l-4 border-foreground p-0"
      >
        <div className="flex h-14 items-center border-b-4 border-foreground px-6">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/logo-light.png"
              alt={siteConfig.name}
              width={1080}
              height={1080}
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt={siteConfig.name}
              width={1080}
              height={1080}
              className="hidden h-8 w-auto dark:block"
            />
          </Link>
        </div>
        <nav className="space-y-0 px-2 py-3">
          {siteConfig.nav.marketing.map((item) => {
            if (item.href === "/products" && categories.length > 0) {
              return (
                <ProductsMobileItem
                  key={item.href}
                  categories={categories}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-base font-semibold uppercase tracking-wide transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
