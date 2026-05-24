"use server"
import { productsService } from "@/features/products/services"
import type { Product } from "@/features/products/types"

interface Filters {
  category?: string
  search?: string
  sort?: "newest" | "oldest" | "name_asc" | "name_desc"
}

export async function fetchMoreProducts(page: number, filters: Filters) {
  try {
    const result = await productsService.getPublishedProducts(page, filters as Parameters<typeof productsService.getPublishedProducts>[1])
    return {
      items: result.items as Product[],
      hasMore: page < result.totalPages,
    }
  } catch {
    return { items: [], hasMore: false }
  }
}
