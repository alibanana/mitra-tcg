import { randomUUID } from "crypto"
import path from "path"
import { bucket } from "./gcs"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "./constants"

export async function uploadFile(file: File): Promise<{ filename: string; url: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid file type")
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large")
  }

  const ext = path.extname(file.name)
  const gcsFilename = `${randomUUID()}${ext}`
  const gcsFile = bucket.file(gcsFilename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await gcsFile.save(buffer, { contentType: file.type, resumable: false })

  const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsFilename}`
  return { filename: file.name, url }
}

export async function uploadFromUrl(imageUrl: string): Promise<string> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error(`Failed to download image: ${response.status}`)

      const contentType = response.headers.get("content-type") ?? "image/jpeg"
      const ext = contentType.includes("png") ? ".png" : ".jpg"
      const gcsFilename = `${randomUUID()}${ext}`
      const gcsFile = bucket.file(gcsFilename)

      const buffer = Buffer.from(await response.arrayBuffer())
      await gcsFile.save(buffer, { contentType, resumable: false })

      return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsFilename}`
    } catch (err) {
      lastError = err
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000))
    }
  }
  throw lastError
}

export async function deleteFile(url: string): Promise<void> {
  const gcsFilename = url.split("/").pop()
  if (!gcsFilename) return
  try {
    await bucket.file(gcsFilename).delete()
  } catch {
    // File may already be deleted
  }
}
