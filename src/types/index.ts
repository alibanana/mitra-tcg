export type Role = "SUPER_ADMIN" | "ADMIN"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type NavigationItem = {
  title: string
  href: string
}
