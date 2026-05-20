"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { slugify } from "@/lib/utils"
import { uploadFromUrl, deleteFile } from "@/lib/upload"
import { setJobStatus } from "@/lib/psa-job-store"
import { prisma } from "@/lib/prisma"
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

export async function bulkDeleteProductsAction(
  ids: string[],
): Promise<{ success: true } | { error: string }> {
  await requireAuth()
  if (ids.length === 0) return { error: "No products selected" }

  const products = await Promise.all(ids.map((id) => productsService.getProductById(id)))
  const found = products.filter(Boolean) as NonNullable<(typeof products)[0]>[]

  await Promise.all(found.flatMap((p) => p.images.map((url) => deleteFile(url))))
  await Promise.all(found.map((p) => productsService.deleteProduct(p.id)))

  revalidatePath("/dashboard/products")
  revalidatePath("/products")
  for (const p of found) revalidatePath(`/products/${p.slug}`)

  return { success: true }
}

export async function fetchPsaPopulationAction(
  specId: number,
): Promise<{ data: unknown } | { error: string }> {
  const token = process.env.PSA_TOKEN
  if (!token) return { error: "PSA_TOKEN is not configured" }

  const res = await fetch(
    `https://api.psacard.com/publicapi/pop/GetPSASpecPopulation/${specId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return { error: "Failed to fetch population data" }

  return { data: await res.json() }
}

export async function refreshPsaPopulationAction(
  psaCertId: string,
): Promise<{ success: true; updatedAt: string } | { error: string }> {
  await requireAuth()

  const token = process.env.PSA_TOKEN
  if (!token) return { error: "PSA_TOKEN is not configured" }

  const psaCert = await prisma.psaCert.findUnique({ where: { id: psaCertId } })
  if (!psaCert) return { error: "PSA cert not found" }

  const res = await fetch(
    `https://api.psacard.com/publicapi/pop/GetPSASpecPopulation/${psaCert.specId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return { error: "Failed to fetch PSA population data" }

  const data = await res.json()
  const now = new Date()

  await prisma.psaCert.update({
    where: { id: psaCertId },
    data: { psaPopulation: data, psaPopPopulatedAt: now },
  })

  revalidatePath(`/dashboard/products`)
  revalidatePath(`/products`)

  return { success: true, updatedAt: now.toISOString() }
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
  CertNumber: string
  SpecID: number
  SpecNumber: string
  LabelType?: string
  ReverseBarCode?: boolean
  Year?: string
  Brand?: string
  Category?: string
  CardNumber?: string
  Subject?: string
  Variety?: string
  GradeDescription?: string
  CardGrade?: string
  TotalPopulation?: number
  TotalPopulationWithQualifier?: number
  PopulationHigher?: number
  IsPSADNA?: boolean
  IsDualCert?: boolean
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

  const headers = { Authorization: `Bearer ${token}` }

  const certRes = await fetch(
    `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certId}`,
    { headers },
  )
  if (certRes.status === 400) return { error: "Invalid certificate number. Please check the cert ID and try again." }
  if (!certRes.ok) return { error: "Failed to reach PSA. Please try again." }

  const certData = await certRes.json()
  const cert: PSACert = certData.PSACert
  if (!cert) return { error: "No cert data found for this ID." }

  const jobId = randomUUID()
  setJobStatus(jobId, "pending")

  after(async () => {
    try {
      const name = [cert.Year, cert.Brand, `#${cert.CardNumber}`, cert.Subject, cert.Variety]
        .filter(Boolean).join(" ")

      const [imagesRes, popRes] = await Promise.all([
        fetch(`https://api.psacard.com/publicapi/cert/GetImagesByCertNumber/${certId}`, { headers }),
        fetch(`https://api.psacard.com/publicapi/pop/GetPSASpecPopulation/${cert.SpecID}`, { headers }),
      ])
      if (!imagesRes.ok) { setJobStatus(jobId, "failed"); return }

      const imagesData: PSAImage[] = await imagesRes.json()
      const sortedImages = [
        ...imagesData.filter((img) => img.IsFrontImage),
        ...imagesData.filter((img) => !img.IsFrontImage),
      ]
      if (sortedImages.length === 0) { setJobStatus(jobId, "failed"); return }

      const popData = popRes.ok ? await popRes.json() : null

      const uploadedUrls: string[] = []
      for (const img of sortedImages) {
        uploadedUrls.push(await uploadFromUrl(img.ImageURL))
      }

      const product = await productsService.createProduct({
        name,
        slug: slugify(name),
        description: "",
        images: uploadedUrls,
        categoryId,
        published: false,
        sold: false,
      })

      await prisma.psaCert.create({
        data: {
          productId: product.id,
          certNumber: cert.CertNumber,
          specId: cert.SpecID,
          specNumber: cert.SpecNumber,
          labelType: cert.LabelType ?? null,
          reverseBarCode: cert.ReverseBarCode ?? false,
          year: cert.Year ?? null,
          brand: cert.Brand ?? null,
          psaCategory: cert.Category ?? null,
          cardNumber: cert.CardNumber ?? null,
          subject: cert.Subject ?? null,
          variety: cert.Variety ?? null,
          gradeDescription: cert.GradeDescription ?? null,
          cardGrade: cert.CardGrade ?? null,
          totalPopulation: cert.TotalPopulation ?? 0,
          totalPopulationWithQualifier: cert.TotalPopulationWithQualifier ?? 0,
          populationHigher: cert.PopulationHigher ?? 0,
          isPsaDna: cert.IsPSADNA ?? false,
          isDualCert: cert.IsDualCert ?? false,
          psaPopulation: popData ?? undefined,
          psaPopPopulatedAt: popData ? new Date() : null,
        },
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
