"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { ImageUploader } from "@/components/dashboard/image-uploader"
import { updateHeroImagesAction } from "@/features/settings/actions"

interface HeroImagesPickerProps {
  initialImages: string[]
}

export function HeroImagesPicker({ initialImages }: HeroImagesPickerProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(urls: string[]) {
    startTransition(async () => {
      const result = await updateHeroImagesAction(urls)
      if (result?.error) {
        toast.error("Failed to save hero images")
      }
    })
  }

  return (
    <div className="space-y-2">
      {isPending && (
        <p className="text-xs text-muted-foreground">Saving…</p>
      )}
      <ImageUploader initialUrls={initialImages} onChange={handleChange} />
    </div>
  )
}
