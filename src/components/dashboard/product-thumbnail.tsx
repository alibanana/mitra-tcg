"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductThumbnailProps {
  src: string
  alt: string
}

export function ProductThumbnail({ src, alt }: ProductThumbnailProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return <div className="w-[192px] shrink-0 border border-foreground/20 bg-muted" style={{ aspectRatio: "3/4" }} />
  }

  return (
    <div className="relative w-[192px] shrink-0 border border-foreground/20 bg-muted" style={{ aspectRatio: "3/4" }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="192px"
        loading="lazy"
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  )
}
