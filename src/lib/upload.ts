import { randomUUID } from "crypto"
import path from "path"
import sharp from "sharp"
import { bucket } from "./gcs"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "./constants"

const UNCOMPRESSABLE = new Set(["image/svg+xml", "image/gif"])

// Binary search for the highest JPEG quality that stays within maxBytes.
// Always returns a buffer — falls back to quality 20 if nothing fits.
async function findBestQuality(source: Buffer, maxBytes: number): Promise<Buffer> {
  let lo = 20
  let hi = 85
  let best = await sharp(source).jpeg({ quality: lo }).toBuffer()

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const candidate = await sharp(source).jpeg({ quality: mid }).toBuffer()
    if (candidate.length <= maxBytes) {
      best = candidate
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return best
}

async function compressToLimit(
  buffer: Buffer,
  contentType: string,
  type?: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (UNCOMPRESSABLE.has(contentType)) return { buffer, contentType }

  const maxBytes = (Number(process.env.IMAGE_MAX_KB) || 500) * 1024
  if (buffer.length <= maxBytes) return { buffer, contentType }

  const maxWidth = Number(process.env.IMAGE_MAX_WIDTH) || undefined
  const maxHeight = Number(process.env.IMAGE_MAX_HEIGHT) || undefined
  const { width: origWidth = 0, height: origHeight = 0 } = await sharp(buffer).metadata()
  const isPortrait = origHeight > origWidth
  const useWidthOnly = type === "hero" || !isPortrait

  // If max dims are configured, try progressively smaller scales until we fit.
  // Without max dims, a single quality-reduction pass is all we can do.
  const scales = maxWidth || maxHeight ? [1, 0.75, 0.5, 0.25] : [1]

  for (const scale of scales) {
    let targetWidth: number | undefined
    let targetHeight: number | undefined

    if (useWidthOnly) {
      const base = maxWidth ?? origWidth
      targetWidth = scale < 1 ? Math.round(base * scale) : maxWidth
    } else {
      const base = maxHeight ?? origHeight
      targetHeight = scale < 1 ? Math.round(base * scale) : maxHeight
    }

    const resized = await sharp(buffer)
      .resize({ width: targetWidth, height: targetHeight, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    const compressed = await findBestQuality(resized, maxBytes)
    if (compressed.length <= maxBytes) return { buffer: compressed, contentType: "image/jpeg" }

    // Exhausted all scales — return the best effort (smallest we achieved)
    if (scale === scales.at(-1)) return { buffer: compressed, contentType: "image/jpeg" }
  }

  // Unreachable, but satisfies TypeScript
  return { buffer: await sharp(buffer).jpeg({ quality: 20 }).toBuffer(), contentType: "image/jpeg" }
}

export async function uploadFile(file: File, type?: string): Promise<{ filename: string; url: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid file type")
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large")
  }

  const raw = Buffer.from(await file.arrayBuffer())
  const { buffer, contentType } = await compressToLimit(raw, file.type, type)

  const ext = contentType === "image/jpeg" ? ".jpg" : path.extname(file.name)
  const gcsFilename = `${randomUUID()}${ext}`
  const gcsFile = bucket.file(gcsFilename)

  await gcsFile.save(buffer, { contentType, resumable: false })

  const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsFilename}`
  return { filename: file.name, url }
}

export async function uploadFromUrl(imageUrl: string): Promise<string> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error(`Failed to download image: ${response.status}`)

      const originalContentType = response.headers.get("content-type") ?? "image/jpeg"
      const raw = Buffer.from(await response.arrayBuffer())

      const { buffer, contentType } = await compressToLimit(raw, originalContentType)
      const ext = contentType === "image/jpeg" ? ".jpg" : originalContentType.includes("png") ? ".png" : ".jpg"

      const gcsFilename = `${randomUUID()}${ext}`
      const gcsFile = bucket.file(gcsFilename)

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
