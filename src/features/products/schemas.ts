import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  description: z.string().optional().default(""),
  images: z.array(z.string().url()).min(2, "At least 2 images are required"),
  categoryId: z.string().min(1, "Category is required"),
  sold: z.boolean().default(false),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export type ProductFilterData = z.infer<typeof productFilterSchema>
