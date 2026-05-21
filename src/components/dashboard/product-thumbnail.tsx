"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductThumbnailProps {
  src: string
  alt: string
  className?: string
  sizes?: string
}

export function ProductThumbnail({ src, alt, className = "w-[192px]", sizes = "192px" }: ProductThumbnailProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return <div className={`${className} shrink-0 border border-foreground/20 bg-muted`} style={{ aspectRatio: "3/4" }} />
  }

  return (
    <div className={`relative ${className} shrink-0 border border-foreground/20 bg-muted`} style={{ aspectRatio: "3/4" }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading="lazy"
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  )
}
