export const dynamic = "force-dynamic"
import Link from "next/link"
import { productsService } from "@/features/products/services"
import { ProductThumbnail } from "@/components/dashboard/product-thumbnail"
import { categoriesService } from "@/features/categories/services"
import { AddProductModal } from "@/features/products/components/add-product-modal"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"
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

      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Product</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-foreground/10">
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No products yet. Add your first one!
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <ProductThumbnail src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="w-[192px] shrink-0 border border-foreground/20 bg-muted" style={{ aspectRatio: "3/4" }} />
                    )}
                    <span className="truncate font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.category.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {product.published ? (
                      <span className="bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
                        Live
                      </span>
                    ) : (
                      <span className="border border-foreground/30 px-2 py-0.5 text-xs font-bold uppercase text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
