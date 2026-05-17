const reasons = [
  {
    icon: "✓",
    title: "Authentic Cards",
    description: "Every card is verified authentic. No counterfeits, ever.",
  },
  {
    icon: "🚚",
    title: "Fast Shipping",
    description: "Same-day or next-day dispatch across Indonesia.",
  },
  {
    icon: "🇺🇸",
    title: "English Cards",
    description: "Specialising in English language cards, raw and graded.",
  },
  {
    icon: "🏆",
    title: "PSA & BGS Graded",
    description: "Professional grading available. Gemstone condition cards.",
  },
]

export function WhyMitra() {
  return (
    <section className="border-b border-border py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="theme-tagline text-xs text-muted-foreground">Why Choose Us</p>
        <h2 className="mt-2 text-3xl font-bold">Mitra TCG</h2>

        <div className="site-services-grid mt-8">
          {reasons.map((reason) => (
            <div key={reason.title} className="site-service-item flex">
              <span className="text-2xl">{reason.icon}</span>
              <div className="mt-3">
                <p className="text-sm font-bold">{reason.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
