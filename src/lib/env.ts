import { z } from "zod"

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  GCS_PROJECT_ID: z.string().min(1),
  GCS_BUCKET_NAME: z.string().min(1),
  GCS_CLIENT_EMAIL: z.string().email(),
  GCS_PRIVATE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_WHATSAPP_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors)
    throw new Error("Invalid environment variables")
  }
  return parsed.data
}
