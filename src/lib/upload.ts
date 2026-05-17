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

export async function deleteFile(url: string): Promise<void> {
  const gcsFilename = url.split("/").pop()
  if (!gcsFilename) return
  try {
    await bucket.file(gcsFilename).delete()
  } catch {
    // File may already be deleted
  }
}
