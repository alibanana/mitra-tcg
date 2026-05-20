export const dynamic = "force-dynamic"
import { Hero } from "@/components/marketing/hero"
import { InstagramFeed } from "@/components/marketing/instagram-feed"
import { CtaSection } from "@/components/marketing/cta-section"
import { settingsService } from "@/features/settings/services"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mitra TCG — Premium One Piece & Pokémon Cards",
  description:
    "English raw and graded trading cards. One Piece & Pokémon singles, sealed product, and accessories shipped across Indonesia.",
}

export default async function HomePage() {
  const [heroImagesRaw, heroCardsRaw] = await Promise.all([
    settingsService.getValue("hero_background_images", "[]").catch(() => "[]"),
    settingsService.getValue("hero_card_images", "[]").catch(() => "[]"),
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

  return (
    <>
      <Hero backgroundImages={heroImages} cardImages={heroCards} />
      <InstagramFeed />
      <CtaSection />
    </>
  )
}
