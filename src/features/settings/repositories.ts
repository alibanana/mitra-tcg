import { prisma } from "@/lib/prisma"

export const settingsRepository = {
  findMany() {
    return prisma.siteSetting.findMany({ orderBy: { key: "asc" } })
  },

  findByKey(key: string) {
    return prisma.siteSetting.findUnique({ where: { key } })
  },

  upsert(key: string, value: string) {
    return prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  },

  delete(key: string) {
    return prisma.siteSetting.delete({ where: { key } })
  },
}
