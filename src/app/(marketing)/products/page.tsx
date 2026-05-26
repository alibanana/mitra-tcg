export const dynamic = "force-dynamic"
import { Suspense } from "react"
import { productsService } from "@/features/products/services"
import { categoriesService } from "@/features/categories/services"
import { settingsService } from "@/features/settings/services"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { CtaSection } from "@/components/marketing/cta-section"
import Link from "next/link"
import { normalizeUrl } from "@/lib/utils"
import type { Metadata } from "next"
import type { Product } from "@/features/products/types"

export const metadata: Metadata = { title: "Products" }

const VALID_SORTS = ["newest", "oldest", "name_asc", "name_desc"] as const
type SortValue = typeof VALID_SORTS[number]

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const raw = await searchParams
  const sort = (VALID_SORTS as readonly string[]).includes(raw.sort ?? "") ? raw.sort as SortValue : undefined
  const params = {
    ...(raw.category ? { category: raw.category } : {}),
    ...(raw.search ? { search: raw.search } : {}),
    ...(sort ? { sort } : {}),
  }

  const [result, flatCategories, rawWhatsappUrl] = await Promise.all([
    productsService.getPublishedProducts(1, params).catch(() => ({ items: [], total: 0, totalPages: 0 })),
    categoriesService.getFlatCategories().catch(() => []),
    settingsService.getValue("whatsapp_url").catch(() => null),
  ])
  const whatsappUrl = rawWhatsappUrl ? normalizeUrl(rawWhatsappUrl) : null

  const products = result.items as Product[]
  const { total, totalPages } = result
  const filterKey = JSON.stringify(params)

  return (
    <>
      <div className="border-b border-border bg-background py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-4xl md:text-5xl">Our Products</h1>
          <p className="mt-3 text-sm text-muted-foreground">{total} products</p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <ProductFilters categories={flatCategories} />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="text-2xl font-bold uppercase">No Products Found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
              <Link
                href="/products"
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-foreground"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <ProductGrid
              key={filterKey}
              initialProducts={products}
              initialHasMore={totalPages > 1}
              filters={params}
              whatsappUrl={whatsappUrl}
            />
          )}
        </div>
      </div>
      <CtaSection />
    </>
  )
}
