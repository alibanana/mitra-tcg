export const dynamic = "force-dynamic"
import { Hero } from "@/components/marketing/hero"
import { InstagramFeed } from "@/components/marketing/instagram-feed"
import { CtaSection } from "@/components/marketing/cta-section"
import { settingsService } from "@/features/settings/services"
import { generateMetadata as buildMetadata } from "@/lib/seo"
import { siteConfig } from "@/config/site"
import type { Metadata } from "next"

export const metadata: Metadata = buildMetadata({
  title: "Mitra TCG — Premium One Piece & Pokémon Cards",
  description:
    "English raw and graded trading cards. One Piece & Pokémon singles, sealed product, and accessories shipped across Indonesia.",
  path: "/",
  image: `${siteConfig.url}/logo-light.png`,
})

export default async function HomePage() {
  const [heroImagesRaw, heroCardsRaw, rawInstagramUrl] = await Promise.all([
    settingsService.getValue("hero_background_images", "[]").catch(() => "[]"),
    settingsService.getValue("hero_card_images", "[]").catch(() => "[]"),
    settingsService.getValue("instagram_url").catch(() => ""),
  ])

  let heroImages: string[] = []
  try {
    heroImages = JSON.parse(heroImagesRaw)
    if (!Array.isArray(heroImages)) heroImages = []
  } catch {
    heroImages = []
  }

  let heroCards: string[] = []
  try {
    heroCards = JSON.parse(heroCardsRaw)
    if (!Array.isArray(heroCards)) heroCards = []
  } catch {
    heroCards = []
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo-light.png`,
      sameAs: [siteConfig.instagram],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: siteConfig.url,
      name: siteConfig.name,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/products?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero backgroundImages={heroImages} cardImages={heroCards} instagramUrl={rawInstagramUrl || undefined} />
      <InstagramFeed />
      <CtaSection />
    </>
  )
}
