import { CtaSection } from "@/components/marketing/cta-section"
import { siteConfig } from "@/config/site"
import { settingsService } from "@/features/settings/services"
import { generateMetadata as buildMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Learn more about Mitra TCG — your trusted source for English One Piece and Pokémon cards in Indonesia. 100% authentic raw and graded singles.",
  path: "/about",
})

function extractInstagramHandle(url: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/^\/|\/$/g, "")
    if (pathname) return `@${pathname}`
  } catch {}
  return "@mitratcg"
}

export default async function AboutPage() {
  const rawInstagramUrl = await settingsService.getValue("instagram_url")
  const instagramUrl = rawInstagramUrl || siteConfig.instagram
  const instagramHandle = extractInstagramHandle(instagramUrl)
  return (
    <>
      <div className="border-b-4 border-foreground bg-background py-16">
        <div className="container mx-auto max-w-3xl px-4 lg:px-8">
          <p className="theme-tagline text-xs text-muted-foreground">Our Story</p>
          <h1 className="mt-3 text-4xl md:text-5xl">About Mitra TCG</h1>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-foreground/80">
            <p>
              Mitra TCG is an Indonesian online store specialising in English-language trading cards — primarily
              One Piece Card Game and Pokémon TCG. We operate via Instagram ({instagramHandle}) and this site,
              offering raw singles, PSA and BGS graded slabs, sealed booster boxes, and accessories.
            </p>

            <div className="border-l-4 border-primary py-2 pl-6">
              <p className="text-lg font-bold">
                &ldquo;Every card we sell is 100% authentic. No fakes, ever.&rdquo;
              </p>
            </div>

            <p>
              We source directly from trusted distributors and fellow collectors, verifying authenticity on
              every single card before it reaches you. Whether you&apos;re pulling for a Luffy Secret Rare
              or hunting a Black Label Charizard, Mitra TCG is your partner.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { title: "Authentic", body: "Every card verified. We stake our reputation on it." },
                { title: "English", body: "Specialising in English language TCG — the global standard." },
                { title: "Graded", body: "PSA, BGS, and CGC graded cards available in our catalog." },
                { title: "Indonesia", body: "Based in Indonesia. Fast domestic shipping nationwide." },
              ].map((item) => (
                <div key={item.title} className="border-2 border-foreground p-5 shadow-[4px_4px_0_var(--foreground)]">
                  <p className="text-sm font-bold uppercase tracking-wide">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>

            <p>
              Follow us on Instagram{" "}
              <a
                href={instagramUrl}
                className="font-bold text-primary underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                {instagramHandle}
              </a>{" "}
              for new arrivals, restocks, and exclusive drops.
            </p>
          </div>
        </div>
      </div>
      <CtaSection />
    </>
  )
}
