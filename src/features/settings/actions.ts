"use server"

import { auth } from "@/lib/auth"
import { settingsService } from "./services"
import { settingsBatchSchema } from "./schemas"
import { revalidatePath } from "next/cache"

export async function updateHeroImagesAction(urls: string[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await settingsService.upsertSetting("hero_background_images", JSON.stringify(urls))
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateSettingsAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const settingsRaw = formData.get("settings") as string
  const parsed = JSON.parse(settingsRaw)
  const validated = settingsBatchSchema.safeParse({ settings: parsed })
  if (!validated.success) return { error: validated.error.flatten().fieldErrors }

  await settingsService.updateBatch(validated.data)
  revalidatePath("/dashboard/settings")
  return { success: true }
}
