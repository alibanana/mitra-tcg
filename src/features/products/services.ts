import { productsRepository } from "./repositories"
import { categoriesRepository } from "@/features/categories/repositories"
import { categoriesService } from "@/features/categories/services"
import type { ProductFormData } from "./schemas"

const PAGE_SIZE = 12

export const productsService = {
  async getPublishedProducts(
    page: number = 1,
    filters: { category?: string; search?: string } = {},
  ) {
    let categoryIds: string[] | undefined
    if (filters.category) {
      const cat = await categoriesRepository.findBySlug(filters.category)
      if (cat) categoryIds = await categoriesService.getDescendantIds(cat.id)
    }
    return productsRepository.findMany({
      published: true,
      page,
      limit: PAGE_SIZE,
      categoryIds,
      search: filters.search,
    })
  },

  async getAllProducts(page: number = 1, search?: string) {
    return productsRepository.findMany({ page, limit: 20, search })
  },

  async getFeaturedProducts(limit: number = 6) {
    const result = await productsRepository.findMany({ published: true, featured: true, limit })
    return result.items
  },

  async getProductBySlug(slug: string) {
    return productsRepository.findBySlug(slug)
  },

  async getProductById(id: string) {
    return productsRepository.findById(id)
  },

  async getRelatedProducts(excludeId: string, categoryId: string, limit: number = 4) {
    const categoryIds = await categoriesService.getDescendantIds(categoryId)
    const result = await productsRepository.findMany({ published: true, categoryIds, limit })
    return result.items.filter((p) => p.id !== excludeId).slice(0, limit)
  },

  async createProduct(data: ProductFormData) {
    return productsRepository.create(data)
  },

  async updateProduct(id: string, data: Partial<ProductFormData>) {
    return productsRepository.update(id, data)
  },

  async deleteProduct(id: string) {
    return productsRepository.delete(id)
  },

  async getProductCount() {
    return productsRepository.count()
  },

  async getPublishedCount() {
    return productsRepository.count({ published: true })
  },

  async getSoldCount() {
    return productsRepository.count({ sold: true })
  },
}
