export const dynamic = "force-dynamic"
import { Hero } from "@/components/marketing/hero"
import { CategoryTiles } from "@/components/marketing/category-tiles"
import { ProductPreview } from "@/components/marketing/product-preview"
import { WhyMitra } from "@/components/marketing/why-mitra"
import { InstagramFeed } from "@/components/marketing/instagram-feed"
import { CtaSection } from "@/components/marketing/cta-section"
import { categoriesService } from "@/features/categories/services"
import { productsService } from "@/features/products/services"
import { settingsService } from "@/features/settings/services"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mitra TCG — Premium One Piece & Pokémon Cards",
  description:
    "English raw and graded trading cards. One Piece & Pokémon singles, sealed product, and accessories shipped across Indonesia.",
}

export default async function HomePage() {
  const [rootCategories, heroImagesRaw, featuredProducts] = await Promise.all([
    categoriesService.getRootCategories().catch(() => []),
    settingsService.getValue("hero_background_images", "[]").catch(() => "[]"),
    productsService.getFeaturedProducts(10).catch(() => []),
  ])

  const cardImages = featuredProducts
    .filter((p) => p.images.length > 0)
    .map((p) => p.images[0])
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  let heroImages: string[] = []
  try {
    heroImages = JSON.parse(heroImagesRaw)
    if (!Array.isArray(heroImages)) heroImages = []
  } catch {
    heroImages = []
  }

  return (
    <>
      <Hero backgroundImages={heroImages} cardImages={cardImages} />
      <CategoryTiles categories={rootCategories} />
      <ProductPreview />
      <WhyMitra />
      <InstagramFeed />
      <CtaSection />
    </>
  )
}
