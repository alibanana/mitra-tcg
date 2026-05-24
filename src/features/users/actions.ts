"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createUser, getAllUsers, updateUserRole, deleteUser } from "@/features/auth/services"
import { createUserSchema } from "./schemas"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  return session
}

export async function fetchUsersAction() {
  await requireSuperAdmin()
  return getAllUsers()
}

export async function createUserAction(formData: FormData): Promise<{ error: string } | { success: true }> {
  await requireSuperAdmin()

  const raw = Object.fromEntries(formData.entries())
  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Invalid input" }
  }

  try {
    await createUser(parsed.data)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user"
    if (msg.includes("Unique constraint")) return { error: "Email already in use" }
    return { error: msg }
  }
}

export async function updateUserRoleAction(
  id: string,
  role: "ADMIN",
): Promise<{ error: string } | { success: true }> {
  const session = await requireSuperAdmin()
  if (session.user.id === id) return { error: "You cannot change your own role" }

  try {
    await updateUserRole(id, role)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch {
    return { error: "Failed to update role" }
  }
}

export async function deleteUserAction(id: string): Promise<{ error: string } | { success: true }> {
  const session = await requireSuperAdmin()
  if (session.user.id === id) return { error: "You cannot delete your own account" }

  try {
    await deleteUser(id)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch {
    return { error: "Failed to delete user" }
  }
}

export async function resetUserPasswordAction(
  id: string,
  newPassword: string,
): Promise<{ error: string } | { success: true }> {
  await requireSuperAdmin()
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" }

  const hashed = await bcrypt.hash(newPassword, 12)
  try {
    await prisma.user.update({ where: { id }, data: { password: hashed } })
    return { success: true }
  } catch {
    return { error: "Failed to reset password" }
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters" }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: "User not found" }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return { error: "Current password is incorrect" }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return { success: true }
}
