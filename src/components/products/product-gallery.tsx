"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center border-2 border-foreground bg-muted">
        <span className="text-6xl opacity-20">🃏</span>
      </div>
    )
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 40) return
    if (delta < 0) {
      setActive((prev) => Math.min(prev + 1, images.length - 1))
    } else {
      setActive((prev) => Math.max(prev - 1, 0))
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden border-2 border-foreground bg-muted shadow-[5px_5px_0_var(--foreground)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image src={images[active]} alt={name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" priority />
      </div>

      {images.length > 1 && (
        <>
          <div className="flex flex-wrap gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-16 overflow-hidden border-2 transition-all",
                  i === active
                    ? "border-primary shadow-[2px_2px_0_var(--primary)]"
                    : "border-foreground/30 hover:border-foreground",
                )}
              >
                <Image src={src} alt={`${name} ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
