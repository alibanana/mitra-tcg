import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return user
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}

export async function createUser(data: { email: string; password: string; name: string; role?: string }) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: (data.role as "ADMIN" | "EDITOR") || "EDITOR",
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}
