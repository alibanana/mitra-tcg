import { prisma } from "@/lib/prisma"
import type { ProductFormData } from "./schemas"
import { Prisma } from "@prisma/client"

const PAGE_SIZE = 12

export interface FindManyOptions {
  categoryIds?: string[]
  search?: string
  published?: boolean
  sold?: boolean
  page?: number
  limit?: number
  orderBy?: "createdAt" | "name" | "updatedAt"
  orderDir?: "asc" | "desc"
}

function buildWhere(options: FindManyOptions): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}
  if (options.categoryIds?.length) where.categoryId = { in: options.categoryIds }
  if (options.published !== undefined) where.published = options.published
  if (options.sold !== undefined) where.sold = options.sold
  if (options.search) where.name = { contains: options.search, mode: "insensitive" }
  return where
}

const categoryInclude = { category: true } as const
const fullInclude = { category: true, psaCert: true } as const

export const productsRepository = {
  async findMany(options: FindManyOptions = {}) {
    const limit = options.limit ?? PAGE_SIZE
    const page = options.page ?? 1
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: buildWhere(options),
        include: categoryInclude,
        orderBy: options.orderBy
          ? { [options.orderBy]: options.orderDir ?? "desc" }
          : { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: buildWhere(options) }),
    ])

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug }, include: fullInclude })
  },

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: fullInclude })
  },

  async create(data: ProductFormData) {
    const { slug, ...rest } = data
    return prisma.product.create({ data: { ...rest, slug: slug ?? "" }, include: categoryInclude })
  },

  async update(id: string, data: Partial<ProductFormData>) {
    return prisma.product.update({ where: { id }, data, include: categoryInclude })
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },

  async count(options: FindManyOptions = {}) {
    return prisma.product.count({ where: buildWhere(options) })
  },
}
