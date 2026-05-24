"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import type { Product } from "@/features/products/types"

interface ProductCardProps {
  product: Product
  priority?: boolean
  whatsappUrl?: string | null
}

export function ProductCard({ product, priority = false, whatsappUrl }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const inquiryUrl = whatsappUrl
    ? `${whatsappUrl}?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}`
    : null

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {product.images[0] ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              loading={priority ? "eager" : "lazy"}
              className="object-cover"
              style={{ opacity: hovered ? 0 : 1, transition: "opacity 600ms ease-in-out" }}
            />
            {product.images[1] && (
              <Image
                src={product.images[1]}
                alt={`${product.name} — alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading="lazy"
                className="object-cover"
                style={{ opacity: hovered ? 1 : 0, transition: "opacity 600ms ease-in-out" }}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-20">🃏</span>
          </div>
        )}
        {product.sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-white px-4 py-1 text-xs font-bold text-black">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {product.category.name}
          </span>
        </div>

        <p className="flex-1 text-sm font-semibold leading-snug">{product.name}</p>

        <div className="mt-auto">
          {!product.sold && inquiryUrl ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(inquiryUrl, "_blank", "noopener,noreferrer")
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Message us
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <MessageCircle className="h-3.5 w-3.5" />
              {product.sold ? "Sold Out" : "Message us"}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
