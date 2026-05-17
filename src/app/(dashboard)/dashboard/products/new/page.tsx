export const dynamic = "force-dynamic"
import { categoriesService } from "@/features/categories/services"
import { ProductForm } from "@/features/products/components/product-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "New Product" }

export default async function NewProductPage() {
  const flatCategories = await categoriesService.getFlatCategories().catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the details to add a new product.</p>
      </div>
      <ProductForm flatCategories={flatCategories} />
    </div>
  )
}
