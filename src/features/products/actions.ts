"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { slugify } from "@/lib/utils"
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

  await productsService.deleteProduct(id)

  revalidatePath("/dashboard/products")
  revalidatePath("/products")
  redirect("/dashboard/products")
}
