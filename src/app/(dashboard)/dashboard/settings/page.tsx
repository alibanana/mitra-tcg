export const dynamic = "force-dynamic"
import { revalidatePath } from "next/cache"
import { settingsService } from "@/features/settings/services"
import { updateSettingsAction } from "@/features/settings/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HeroImagesPicker } from "@/components/dashboard/hero-images-picker"
import { InstagramPostsManager } from "@/components/dashboard/instagram-posts-manager"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const settings = await settingsService.getAll().catch(() => [])
  const s = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))

  let heroImages: string[] = []
  try {
    const parsed = JSON.parse(s.hero_background_images ?? "[]")
    if (Array.isArray(parsed)) heroImages = parsed
  } catch {
    heroImages = []
  }

  let instagramPostIds: string[] = []
  try {
    const parsed = JSON.parse(s.instagram_post_ids ?? "[]")
    if (Array.isArray(parsed)) instagramPostIds = parsed
  } catch {
    instagramPostIds = []
  }

  async function saveSettings(formData: FormData) {
    "use server"
    const settingsArray = [
      { key: "site_title", value: formData.get("site_title") as string },
      { key: "site_description", value: formData.get("site_description") as string },
      { key: "whatsapp_url", value: formData.get("whatsapp_url") as string },
      { key: "instagram_url", value: formData.get("instagram_url") as string },
    ]
    formData.set("settings", JSON.stringify(settingsArray))
    await updateSettingsAction(formData)
    revalidatePath("/", "layout")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your site content and social links.
        </p>
      </div>

      <form key={JSON.stringify(s)} action={saveSettings} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Site Identity</CardTitle>
            <CardDescription>Basic information about your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                name="site_title"
                defaultValue={s.site_title ?? "Mitra TCG"}
                placeholder="Mitra TCG"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                name="site_description"
                rows={3}
                defaultValue={s.site_description ?? ""}
                placeholder="One Piece & Pokémon Trading Cards — English Raw & Graded"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social Links</CardTitle>
            <CardDescription>Links displayed in the site header and footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                defaultValue={s.instagram_url ?? "https://instagram.com/mitra.tcg"}
                placeholder="https://instagram.com/mitra.tcg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp_url">WhatsApp URL</Label>
              <Input
                id="whatsapp_url"
                name="whatsapp_url"
                defaultValue={s.whatsapp_url ?? ""}
                placeholder="https://wa.me/628XXXXXXXXXX"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instagram Feed</CardTitle>
          <CardDescription>
            Posts shown in the &quot;From Our Instagram&quot; section on the homepage. Paste a post URL or short ID and click Add.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstagramPostsManager initialPostIds={instagramPostIds} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero Background</CardTitle>
          <CardDescription>
            Images that cycle as the landing page hero background. Changes save automatically. Leave empty for the default plain background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroImagesPicker initialImages={heroImages} />
        </CardContent>
      </Card>
    </div>
  )
}
