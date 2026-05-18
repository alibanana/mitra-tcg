"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { slugify } from "@/lib/utils"
import { uploadFromUrl, deleteFile } from "@/lib/upload"
import { setJobStatus } from "@/lib/psa-job-store"
import { productsService } from "./services"
import { productSchema } from "./schemas"

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  return session
}

export async function createProductAction(formData: FormData) {
  await requireAuth()

  const raw = Object.fromEntries(formData.entries())
  const images = formData.getAll("images") as string[]

  const parsed = productSchema.safeParse({
    ...raw,
    slug: raw.slug || slugify(String(raw.name ?? "")),
    images,
    featured: raw.featured === "true",
    published: raw.published === "true",
    sold: raw.sold === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const product = await productsService.createProduct(parsed.data)

  revalidatePath("/dashboard/products")
  revalidatePath("/products")
  redirect(`/dashboard/products/${product.id}/edit`)
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAuth()

  const raw = Object.fromEntries(formData.entries())
  const images = formData.getAll("images") as string[]

  const parsed = productSchema.safeParse({
    ...raw,
    images,
    featured: raw.featured === "true",
    published: raw.published === "true",
    sold: raw.sold === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const product = await productsService.updateProduct(id, parsed.data)

  revalidatePath("/dashboard/products")
  revalidatePath("/products")
  revalidatePath(`/products/${product.slug}`)

  return { success: true }
}

export async function deleteProductAction(id: string) {
  await requireAuth()

  const product = await productsService.getProductById(id)
  if (!product) return { error: "Product not found" }

  await Promise.all(product.images.map((url) => deleteFile(url)))
  await productsService.deleteProduct(id)

  revalidatePath("/dashboard/products")
  revalidatePath("/products")
  redirect("/dashboard/products")
}

interface PSACert {
  Year: string
  Brand: string
  CardNumber: string
  Subject: string
  Variety: string
}

interface PSAImage {
  IsFrontImage: boolean
  ImageURL: string
}

export async function importFromPSAAction(
  certId: string,
  categoryId: string,
): Promise<{ error: string } | { success: true; jobId: string }> {
  await requireAuth()

  const token = process.env.PSA_TOKEN
  if (!token) return { error: "PSA_TOKEN is not configured" }

  const jobId = randomUUID()
  setJobStatus(jobId, "pending")

  after(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }

      const certRes = await fetch(
        `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certId}`,
        { headers },
      )
      if (!certRes.ok) { setJobStatus(jobId, "failed"); return }

      const certData = await certRes.json()
      const cert: PSACert = certData.PSACert
      if (!cert) { setJobStatus(jobId, "failed"); return }

      const name = [cert.Year, cert.Brand, `#${cert.CardNumber}`, cert.Subject, cert.Variety]
        .filter(Boolean).join(" ")

      const imagesRes = await fetch(
        `https://api.psacard.com/publicapi/cert/GetImagesByCertNumber/${certId}`,
        { headers },
      )
      if (!imagesRes.ok) { setJobStatus(jobId, "failed"); return }

      const imagesData: PSAImage[] = await imagesRes.json()
      const sortedImages = [
        ...imagesData.filter((img) => img.IsFrontImage),
        ...imagesData.filter((img) => !img.IsFrontImage),
      ]
      if (sortedImages.length === 0) { setJobStatus(jobId, "failed"); return }

      const uploadedUrls: string[] = []
      for (const img of sortedImages) {
        uploadedUrls.push(await uploadFromUrl(img.ImageURL))
      }

      await productsService.createProduct({
        name,
        slug: slugify(name),
        description: "",
        images: uploadedUrls,
        categoryId,
        featured: false,
        published: false,
        sold: false,
      })

      revalidatePath("/dashboard/products")
      revalidatePath("/products")
      setJobStatus(jobId, "done")
    } catch {
      setJobStatus(jobId, "failed")
    }
  })

  return { success: true, jobId }
}
