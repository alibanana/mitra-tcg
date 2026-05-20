import { settingsService } from "@/features/settings/services"

export async function InstagramFeed() {
  const [raw, instagramUrl] = await Promise.all([
    settingsService.getValue("instagram_post_ids", "[]").catch(() => "[]"),
    settingsService.getValue("instagram_url", "https://instagram.com/mitra.tcg").catch(() => "https://instagram.com/mitra.tcg"),
  ])

  let postIds: string[] = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) postIds = parsed
  } catch {
    postIds = []
  }

  if (postIds.length === 0) return null

  return (
    <section className="border-b border-border py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="theme-tagline text-xs text-muted-foreground">Latest Content</p>
        <h2 className="mt-2 text-3xl font-bold">From Our Instagram</h2>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {postIds.map((id) => (
            <div key={id} className="overflow-hidden rounded-xl">
              <iframe
                src={`https://www.instagram.com/p/${id}/embed/`}
                scrolling="no"
                frameBorder={0}
                className="h-[480px] w-full"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
