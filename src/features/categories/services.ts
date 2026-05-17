import { categoriesRepository } from "./repositories"
import { flattenTree } from "./types"
import type { CategoryFormData } from "./schemas"
import type { CategoryWithChildren } from "./types"

export const categoriesService = {
  async getAllCategories() {
    return categoriesRepository.findAll()
  },

  async getCategoryTree() {
    const tree = await categoriesRepository.findTree()
    return tree as unknown as CategoryWithChildren[]
  },

  async getFlatCategories() {
    const tree = await categoriesRepository.findTree()
    return flattenTree(tree as unknown as CategoryWithChildren[])
  },

  async getRootCategories() {
    const all = await categoriesRepository.findAll()
    return all.filter((c) => c.parentId === null)
  },

  async getCategoryById(id: string) {
    return categoriesRepository.findById(id)
  },

  async getCategoryBySlug(slug: string) {
    return categoriesRepository.findBySlug(slug)
  },

  async getDescendantIds(id: string) {
    return categoriesRepository.findDescendantIds(id)
  },

  async createCategory(data: CategoryFormData) {
    if (data.parentId) {
      const depth = await getDepth(data.parentId)
      if (depth >= 2) throw new Error("Maximum category depth (3 levels) reached")
    }
    return categoriesRepository.create(data)
  },

  async updateCategory(id: string, data: Partial<CategoryFormData>) {
    if (data.parentId) {
      const depth = await getDepth(data.parentId)
      if (depth >= 2) throw new Error("Maximum category depth (3 levels) reached")
    }
    return categoriesRepository.update(id, data)
  },

  async deleteCategory(id: string) {
    const [products, children] = await Promise.all([
      categoriesRepository.countProducts(id),
      categoriesRepository.countChildren(id),
    ])
    if (products > 0) throw new Error(`Cannot delete: ${products} product(s) use this category`)
    if (children > 0) throw new Error(`Cannot delete: ${children} subcategory(s) exist`)
    return categoriesRepository.delete(id)
  },
}

async function getDepth(id: string): Promise<number> {
  let depth = 0
  let currentId: string | null = id
  while (currentId) {
    const cat = await categoriesRepository.findById(currentId)
    if (!cat) break
    currentId = cat.parentId
    if (currentId) depth++
  }
  return depth
}
