export const dynamic = "force-dynamic"
import { productsService } from "@/features/products/services"
import { categoriesService } from "@/features/categories/services"
import { AddProductModal } from "@/features/products/components/add-product-modal"
import { ProductTable } from "@/features/products/components/product-table"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Products" }

export default async function ProductsPage() {
  const [{ items: products, total }, flatCategories] = await Promise.all([
    productsService.getAllProducts(1).catch(() => ({ items: [], total: 0 })),
    categoriesService.getFlatCategories().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} total products</p>
        </div>
        <AddProductModal flatCategories={flatCategories} />
      </div>

      <ProductTable initialProducts={products} total={total} flatCategories={flatCategories} />
    </div>
  )
}
