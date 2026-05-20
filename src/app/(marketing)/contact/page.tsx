import { siteConfig } from "@/config/site"
import { settingsService } from "@/features/settings/services"
import { ExternalLink } from "lucide-react"
import { ContactForm } from "./contact-form"
import { normalizeUrl } from "@/lib/utils"

export default async function ContactPage() {
  const rawWhatsappUrl = await settingsService.getValue("whatsapp_url")
  const whatsappUrl = rawWhatsappUrl ? normalizeUrl(rawWhatsappUrl) : null

  return (
    <div className="border-b-4 border-foreground bg-background py-16">
      <div className="container mx-auto max-w-4xl px-4 lg:px-8">
        <p className="theme-tagline text-xs text-muted-foreground">Get in Touch</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Contact</h1>

        <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Looking for a specific card? Have a question about an order? Reach out via the form or
              slide into our DMs on Instagram — we respond fast.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 border-2 border-foreground p-4 shadow-[4px_4px_0_var(--foreground)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--foreground)]"
              >
                <ExternalLink className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Instagram</p>
                  <p className="text-sm text-muted-foreground">@mitra.tcg</p>
                </div>
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 border-2 border-foreground bg-primary p-4 shadow-[4px_4px_0_var(--foreground)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--foreground)]"
                >
                  <span className="text-xl text-primary-foreground">💬</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-foreground">WhatsApp</p>
                    <p className="text-sm text-primary-foreground/80">Chat with us directly</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
