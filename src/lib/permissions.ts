import type { Role } from "@/types"

interface UserWithRole {
  role?: Role
}

export function hasRole(user: UserWithRole | null | undefined, role: Role): boolean {
  return user?.role === role
}

export function isSuperAdmin(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "SUPER_ADMIN")
}

export function isAdmin(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "ADMIN") || hasRole(user, "SUPER_ADMIN")
}

export function requireSuperAdmin(user: UserWithRole | null | undefined): void {
  if (!isSuperAdmin(user)) {
    throw new Error("Super admin access required")
  }
}

export function requireAdmin(user: UserWithRole | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error("Admin access required")
  }
}
