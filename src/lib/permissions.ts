import type { Role } from "@/types"

interface UserWithRole {
  role?: Role
}

export function hasRole(user: UserWithRole | null | undefined, role: Role): boolean {
  return user?.role === role
}

export function isAdmin(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "ADMIN")
}

export function isEditor(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "EDITOR") || hasRole(user, "ADMIN")
}

export function requireAdmin(user: UserWithRole | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error("Admin access required")
  }
}

export function requireEditor(user: UserWithRole | null | undefined): void {
  if (!isEditor(user)) {
    throw new Error("Editor access required")
  }
}
