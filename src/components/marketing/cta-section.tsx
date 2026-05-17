import Link from "next/link"

interface CtaSectionProps {
  heading?: string
  body?: string
  cta?: string
  ctaHref?: string
}

export function CtaSection({
  heading = "Find Your Card",
  body = "Browse our full catalog of One Piece and Pokémon cards — raw singles, graded slabs, and sealed product.",
  cta = "Browse Collection →",
  ctaHref = "/products",
}: CtaSectionProps) {
  return (
    <section className="site-cta py-20">
      <div className="container mx-auto px-6 text-center lg:px-12">
        <p className="site-cta-overline theme-tagline text-xs">Mitra TCG</p>
        <h2 className="site-cta-heading mt-4 text-4xl font-bold md:text-5xl">{heading}</h2>
        <p className="site-cta-body mx-auto mt-4 max-w-xl text-base">{body}</p>
        <div className="mt-8">
          <Link
            href={ctaHref}
            className="site-cta-outline-btn inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
