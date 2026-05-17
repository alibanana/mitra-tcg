import Link from "next/link"
import type { Category } from "@/features/categories/types"

interface CategoryTilesProps {
  categories: Category[]
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  if (categories.length === 0) return null

  return (
    <section className="border-b border-border bg-muted/40 py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="theme-tagline text-xs text-muted-foreground">Shop by Category</p>
        <h2 className="mt-2 text-3xl font-bold">Browse</h2>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="site-card group flex flex-col gap-3 p-5"
            >
              <p className="text-sm font-bold">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
