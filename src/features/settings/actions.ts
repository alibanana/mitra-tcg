"use server"

import { auth } from "@/lib/auth"
import { deleteFile } from "@/lib/upload"
import { settingsService } from "./services"
import { settingsBatchSchema } from "./schemas"
import { revalidatePath } from "next/cache"

export async function updateHeroImagesAction(urls: string[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const stored = await settingsService.getValue("hero_background_images", "[]")
  let currentUrls: string[] = []
  try {
    currentUrls = JSON.parse(stored)
  } catch {
    // stored value malformed — treat as empty
  }

  const removed = currentUrls.filter((url) => !urls.includes(url))
  await Promise.all(removed.map((url) => deleteFile(url)))

  await settingsService.upsertSetting("hero_background_images", JSON.stringify(urls))
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateInstagramPostsAction(postIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await settingsService.upsertSetting("instagram_post_ids", JSON.stringify(postIds))
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
