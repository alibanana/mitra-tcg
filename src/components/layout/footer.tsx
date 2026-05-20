import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"
import { ExternalLink } from "lucide-react"
import { categoriesService } from "@/features/categories/services"
import { settingsService } from "@/features/settings/services"

export async function Footer() {
  const [categories, whatsappUrl] = await Promise.all([
    categoriesService.getCategoryTree(),
    settingsService.getValue("whatsapp_url"),
  ])
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo-light.png"
                alt={siteConfig.name}
                width={1080}
                height={1080}
                className="h-28 w-auto dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt={siteConfig.name}
                width={1080}
                height={1080}
                className="hidden h-28 w-auto dark:block"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                @mitra.tcg
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </p>
            <ul className="mt-4 space-y-3">
              {siteConfig.nav.marketing.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {categories.length > 0 && (
            <div className="md:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <ul className="mt-4 space-y-3">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">English Raw &amp; Graded · Indonesia</p>
        </div>
      </div>
    </footer>
  )
}
