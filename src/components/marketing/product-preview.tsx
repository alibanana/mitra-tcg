import Link from "next/link"
import { productsService } from "@/features/products/services"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/features/products/types"

export async function ProductPreview() {
  let products: Awaited<ReturnType<typeof productsService.getFeaturedProducts>> = []
  try {
    products = await productsService.getFeaturedProducts(100)
  } catch {
    return null
  }

  if (products.length === 0) return null

  return (
    <section className="border-b border-border bg-background py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="theme-tagline text-xs text-muted-foreground">Hand-Picked</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Featured</h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-bold uppercase tracking-wide underline-offset-4 hover:underline md:block"
          >
            View All →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as unknown as Product} />
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            href="/products"
            className="text-sm font-bold uppercase tracking-wide underline-offset-4 hover:underline"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  )
}
