export const APP_NAME = "Next.js Boilerplate"

export const ROLES = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const
