import { prisma } from "@/lib/prisma"

export const contactRepository = {
  findMany(options?: { skip?: number; take?: number }) {
    return prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    })
  },

  findById(id: string) {
    return prisma.contactSubmission.findUnique({ where: { id } })
  },

  create(data: { name: string; email: string; phone?: string; message: string }) {
    return prisma.contactSubmission.create({ data })
  },

  markAsRead(id: string) {
    return prisma.contactSubmission.update({ where: { id }, data: { read: true } })
  },

  delete(id: string) {
    return prisma.contactSubmission.delete({ where: { id } })
  },

  count(options?: { unread?: boolean }) {
    return prisma.contactSubmission.count({
      where: options?.unread !== undefined ? { read: !options.unread } : undefined,
    })
  },
}
