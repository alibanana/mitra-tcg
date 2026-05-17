"use client"
import { useEffect, useRef, useState, useTransition } from "react"
import { ProductCard } from "@/components/products/product-card"
import { fetchMoreProducts } from "@/app/(marketing)/products/fetch-action"
import type { Product } from "@/features/products/types"

interface Filters {
  category?: string
  search?: string
}

interface ProductGridProps {
  initialProducts: Product[]
  initialHasMore: boolean
  filters: Filters
}

export function ProductGrid({ initialProducts, initialHasMore, filters }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset when filters change (parent re-mounts via key prop)
  useEffect(() => {
    setProducts(initialProducts)
    setHasMore(initialHasMore)
    setPage(1)
  }, [initialProducts, initialHasMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPending) {
          const nextPage = page + 1
          setPage(nextPage)
          startTransition(async () => {
            const result = await fetchMoreProducts(nextPage, filters)
            setProducts((prev) => [...prev, ...result.items])
            setHasMore(result.hasMore)
          })
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isPending, page, filters])

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i === 0} />
        ))}
      </div>

      <div ref={sentinelRef} className="mt-8 flex items-center justify-center py-4">
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
            Loading more cards…
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-xs text-muted-foreground">All {products.length} cards loaded</p>
        )}
      </div>
    </>
  )
}
