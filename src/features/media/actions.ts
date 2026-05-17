"use server"

import { auth } from "@/lib/auth"
import { mediaService } from "./services"
import { revalidatePath } from "next/cache"

export async function uploadAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const file = formData.get("file") as File | null
  if (!file) return { error: "No file provided" }

  try {
    const asset = await mediaService.uploadFile(file)
    revalidatePath("/dashboard/media")
    return { data: asset }
  } catch (err) {
    console.error("[uploadAction] error:", err)
    return { error: "Upload failed" }
  }
}

export async function deleteMediaAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    await mediaService.deleteFile(id)
    revalidatePath("/dashboard/media")
    return { success: true }
  } catch {
    return { error: "Delete failed" }
  }
}
