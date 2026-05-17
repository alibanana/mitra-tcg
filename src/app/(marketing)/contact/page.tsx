"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, type ContactInput } from "@/features/contact/schemas"
import { submitContactAction } from "@/features/contact/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Loader2, Mail, ExternalLink } from "lucide-react"
import { siteConfig } from "@/config/site"

export default function ContactPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactInput) {
    setError(null)
    const formData = new FormData()
    formData.set("name", data.name)
    formData.set("email", data.email)
    formData.set("phone", data.phone ?? "")
    formData.set("message", data.message)

    const result = await submitContactAction(formData)
    if (result?.error) {
      setError("Failed to submit. Please try again.")
    } else {
      setSuccess(true)
      reset()
    }
  }

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
              {siteConfig.whatsapp && (
                <a
                  href={siteConfig.whatsapp}
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
            {success ? (
              <div className="border-2 border-foreground p-8 shadow-[5px_5px_0_var(--foreground)]">
                <Mail className="h-10 w-10 text-primary" />
                <h2 className="mt-4 text-xl font-bold uppercase">Message Sent!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll get back to you soon. For faster responses, DM us on Instagram.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" {...register("name")} />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" {...register("email")} />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    WhatsApp / Phone{" "}
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="phone" placeholder="+62 8XX XXXX XXXX" {...register("phone")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Which card are you looking for?"
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" className="site-btn-primary w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Message →
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
