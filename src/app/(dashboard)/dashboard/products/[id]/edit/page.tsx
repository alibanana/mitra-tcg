export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { productsService } from "@/features/products/services"
import { categoriesService } from "@/features/categories/services"
import { ProductForm } from "@/features/products/components/product-form"
import type { Metadata } from "next"
import type { Product } from "@/features/products/types"

export const metadata: Metadata = { title: "Edit Product" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, flatCategories] = await Promise.all([
    productsService.getProductById(id).catch(() => null),
    categoriesService.getFlatCategories().catch(() => []),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the details for &ldquo;{product.name}&rdquo;</p>
      </div>
      <ProductForm product={product as Product} flatCategories={flatCategories} />
    </div>
  )
}
