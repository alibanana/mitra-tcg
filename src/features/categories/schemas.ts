import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
})

export type CategoryFormData = z.infer<typeof categorySchema>
