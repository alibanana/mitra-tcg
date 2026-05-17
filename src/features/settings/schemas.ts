import { z } from "zod"

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
})

export const settingsBatchSchema = z.object({
  settings: z.array(settingSchema),
})

export type SettingInput = z.infer<typeof settingSchema>
export type SettingsBatchInput = z.infer<typeof settingsBatchSchema>
