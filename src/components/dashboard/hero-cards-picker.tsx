"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateHeroCardsAction } from "@/features/settings/actions"

interface ProductImage {
  url: string
  productName: string
}

interface HeroCardsPickerProps {
  initialSelected: string[]
  availableImages: ProductImage[]
}

export function HeroCardsPicker({ initialSelected, availableImages }: HeroCardsPickerProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [isPending, startTransition] = useTransition()

  function toggle(url: string) {
    const next = selected.includes(url)
      ? selected.filter((u) => u !== url)
      : selected.length < 3
        ? [...selected, url]
        : selected

    setSelected(next)
    startTransition(async () => {
      const result = await updateHeroCardsAction(next)
      if (result?.error) toast.error("Failed to save hero cards")
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {selected.length}/3 selected
        {isPending && " · Saving…"}
      </p>

      {availableImages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No product images available yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {availableImages.map(({ url, productName }) => {
            const isSelected = selected.includes(url)
            const isDisabled = !isSelected && selected.length >= 3
            return (
              <button
                key={url}
                type="button"
                onClick={() => !isDisabled && toggle(url)}
                title={productName}
                className={cn(
                  "group relative aspect-[3/4] overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-primary"
                    : isDisabled
                      ? "cursor-not-allowed border-foreground/10 opacity-40"
                      : "border-foreground/20 hover:border-foreground",
                )}
              >
                <Image
                  src={url}
                  alt={productName}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
