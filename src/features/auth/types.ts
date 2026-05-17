import type { Role } from "@/types"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}
