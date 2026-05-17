import { prisma } from "@/lib/prisma"

export const mediaRepository = {
  findMany(options?: { skip?: number; take?: number }) {
    return prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    })
  },

  findById(id: string) {
    return prisma.mediaAsset.findUnique({ where: { id } })
  },

  create(data: { filename: string; url: string; mimeType: string; size: number }) {
    return prisma.mediaAsset.create({ data })
  },

  delete(id: string) {
    return prisma.mediaAsset.delete({ where: { id } })
  },

  count() {
    return prisma.mediaAsset.count()
  },
}
