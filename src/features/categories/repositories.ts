import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import type { CategoryFormData } from "./schemas"

export const categoriesRepository = {
  async findAll() {
    return prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
  },

  async findTree() {
    return prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: { children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } })
  },

  async findDescendantIds(id: string): Promise<string[]> {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: { children: true },
        },
      },
    })
    if (!cat) return [id]
    const ids: string[] = [id]
    for (const child of cat.children ?? []) {
      ids.push(child.id)
      for (const grandchild of child.children ?? []) {
        ids.push(grandchild.id)
      }
    }
    return ids
  },

  async create(data: CategoryFormData) {
    const { slug, ...rest } = data
    const maxSortOrder = await prisma.category.aggregate({
      where: { parentId: data.parentId ?? null },
      _max: { sortOrder: true },
    })
    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1
    return prisma.category.create({
      data: { ...rest, slug: slug ?? slugify(data.name), sortOrder },
    })
  },

  async update(id: string, data: Partial<CategoryFormData>) {
    return prisma.category.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },

  async countProducts(id: string) {
    return prisma.product.count({ where: { categoryId: id } })
  },

  async countChildren(id: string) {
    return prisma.category.count({ where: { parentId: id } })
  },

  async updateSortOrders(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map(({ id, sortOrder }) =>
        prisma.category.update({ where: { id }, data: { sortOrder } }),
      ),
    )
  },

  async updatePositions(
    items: { id: string; parentId: string | null; sortOrder: number; slug?: string }[],
  ) {
    return prisma.$transaction(
      items.map(({ id, parentId, sortOrder, slug }) =>
        prisma.category.update({
          where: { id },
          data: { parentId, sortOrder, ...(slug !== undefined ? { slug } : {}) },
        }),
      ),
    )
  },
}
