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
import { categoriesRepository } from "@/features/categories/repositories"
import { categoriesService } from "@/features/categories/services"
import { productSchema } from "./schemas"

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  return session
}

const PSA_BASE = "https://api.psacard.com/publicapi"
const PSA_QUOTA_MSG =
  "PSA API quota exceeded (100/day). Contact collectors-apis@collectors.com."

function getPSATokens(): string[] {
  return (process.env.PSA_TOKEN ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

// Creates a per-job PSA fetch client that automatically rotates to the next
// token when one returns 429 (quota) or 504 (treated as quota).
function createPSAClient(tokens: string[]) {
  const exhausted = new Set<string>()

  async function get(path: string): Promise<Response> {
    const available = tokens.filter((t) => !exhausted.has(t))
    for (const token of available) {
      const res = await fetch(`${PSA_BASE}/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status !== 429 && res.status !== 504) return res
      exhausted.add(token)
    }
    throw new Error("PSA_QUOTA_EXCEEDED")
  }

  return { get }
}

export interface DashboardProductFilters {
  search?: string
  categoryId?: string
  status?: "all" | "published" | "unpublished"
  orderBy?: "createdAt" | "name" | "updatedAt"
  orderDir?: "asc" | "desc"
}

export async function fetchProductsAction(page: number, filters: DashboardProductFilters = {}) {
  await requireAuth()
  const { search, categoryId, status, orderBy, orderDir } = filters

  let categoryIds: string[] | undefined
  if (categoryId) {
    const cat = await categoriesRepository.findBySlug(categoryId)
    if (cat) categoryIds = await categoriesService.getDescendantIds(cat.id)
  }

  return productsService.getAllProducts(page, {
    search,
    categoryIds,
    published: status === "published" ? true : status === "unpublished" ? false : undefined,
    orderBy,
    orderDir,
  })
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

export async function bulkUpdateStatusAction(
  ids: string[],
  published: boolean,
): Promise<{ success: true } | { error: string }> {
  await requireAuth()
  if (ids.length === 0) return { error: "No products selected" }

  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { published } })

  revalidatePath("/dashboard/products")
  revalidatePath("/products")

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
  const tokens = getPSATokens()
  if (tokens.length === 0) return { error: "PSA_TOKEN is not configured" }

  try {
    const psa = createPSAClient(tokens)
    const res = await psa.get(`pop/GetPSASpecPopulation/${specId}`)
    if (!res.ok) return { error: "Failed to fetch population data" }
    return { data: await res.json() }
  } catch {
    return { error: PSA_QUOTA_MSG }
  }
}

export async function refreshPsaPopulationAction(
  psaCertId: string,
): Promise<{ success: true; updatedAt: string } | { error: string }> {
  await requireAuth()

  const tokens = getPSATokens()
  if (tokens.length === 0) return { error: "PSA_TOKEN is not configured" }

  const psaCert = await prisma.psaCert.findUnique({ where: { id: psaCertId } })
  if (!psaCert) return { error: "PSA cert not found" }

  try {
    const psa = createPSAClient(tokens)
    const res = await psa.get(`pop/GetPSASpecPopulation/${psaCert.specId}`)
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
  } catch {
    return { error: PSA_QUOTA_MSG }
  }
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

function startPSAImportJob(certId: string, categoryId: string, tokens: string[]): string {
  const jobId = randomUUID()
  setJobStatus(jobId, "pending")

  after(async () => {
    const psa = createPSAClient(tokens)
    try {
      const certRes = await psa.get(`cert/GetByCertNumber/${certId}`)
      if (!certRes.ok) { setJobStatus(jobId, "failed"); return }

      const certData = await certRes.json()
      const cert: PSACert = certData.PSACert
      if (!cert) { setJobStatus(jobId, "failed"); return }

      const name = [cert.Year, cert.Brand, `#${cert.CardNumber}`, cert.Subject, cert.Variety]
        .filter(Boolean).join(" ")

      const imagesRes = await psa.get(`cert/GetImagesByCertNumber/${certId}`)
      if (!imagesRes.ok) { setJobStatus(jobId, "failed"); return }

      const imagesData: PSAImage[] = await imagesRes.json()
      const sortedImages = [
        ...imagesData.filter((img) => img.IsFrontImage),
        ...imagesData.filter((img) => !img.IsFrontImage),
      ]
      if (sortedImages.length === 0) { setJobStatus(jobId, "failed"); return }

      // Population is optional — don't fail the job if quota is hit here
      let popData = null
      try {
        const popRes = await psa.get(`pop/GetPSASpecPopulation/${cert.SpecID}`)
        if (popRes.ok) popData = await popRes.json()
      } catch { /* quota or error on optional call — proceed without pop data */ }

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
    } catch (err) {
      const isQuota = err instanceof Error && err.message === "PSA_QUOTA_EXCEEDED"
      setJobStatus(jobId, isQuota ? "quota_exceeded" : "failed")
    }
  })

  return jobId
}

export async function importFromPSAAction(
  certId: string,
  categoryId: string,
): Promise<{ error: string } | { success: true; jobId: string }> {
  await requireAuth()

  const tokens = getPSATokens()
  if (tokens.length === 0) return { error: "PSA_TOKEN is not configured" }

  const jobId = startPSAImportJob(certId, categoryId, tokens)
  return { success: true, jobId }
}

export async function bulkImportFromPSAAction(
  certIds: string[],
  categoryId: string,
): Promise<{ error: string } | { jobs: Array<{ certId: string; jobId: string }> }> {
  await requireAuth()

  const tokens = getPSATokens()
  if (tokens.length === 0) return { error: "PSA_TOKEN is not configured" }

  const jobs = certIds.map((certId) => ({
    certId,
    jobId: startPSAImportJob(certId, categoryId, tokens),
  }))

  return { jobs }
}
