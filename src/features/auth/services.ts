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
  const validRoles = ["SUPER_ADMIN", "ADMIN"] as const
  type ValidRole = typeof validRoles[number]
  const role: ValidRole = validRoles.includes(data.role as ValidRole) ? (data.role as ValidRole) : "ADMIN"
  return prisma.user.create({
    data: { email: data.email, password: hashedPassword, name: data.name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function updateUserRole(id: string, role: "ADMIN") {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } })
}
