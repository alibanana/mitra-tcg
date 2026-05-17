export type { Category } from "@/features/categories/types"

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  categoryId: string
  category: import("@/features/categories/types").Category
  sold: boolean
  featured: boolean
  published: boolean
  createdAt: Date
  updatedAt: Date
}
