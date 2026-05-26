"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

interface HeroProps {
  backgroundImages?: string[]
  cardImages?: string[]
  instagramUrl?: string
}

export function Hero({ backgroundImages = [], cardImages = [], instagramUrl = siteConfig.instagram }: HeroProps) {
  const hasCards = cardImages.length > 0
  const [activeIndex, setActiveIndex] = useState(0)
  const hasImages = backgroundImages.length > 0

  useEffect(() => {
    if (!hasImages || backgroundImages.length < 2) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % backgroundImages.length)
    }, 3000)
    return () => clearInterval(id)
  }, [backgroundImages, hasImages])

  return (
    <section
      className={cn(
        "site-hero relative overflow-hidden",
        hasImages && "-mt-20",
      )}
    >
      {/* Background carousel */}
      {hasImages && (
        <>
          {backgroundImages.map((url, i) => (
            <div
              key={url}
              className={cn(
                "absolute inset-0 transition-opacity duration-[800ms] ease-in-out",
                i === activeIndex ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
          {/* Overlay for readability — slightly lighter in light mode, darker in dark */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
        </>
      )}

      <div
        className={cn(
          "relative container mx-auto grid grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-12",
          hasImages
            ? "min-h-screen pt-28 pb-20 text-white lg:pt-24 lg:pb-0"
            : "min-h-[85vh] py-20 lg:py-0",
        )}
      >
        {/* Text */}
        <div className="flex flex-col justify-center">
          <p
            className={cn(
              "theme-tagline text-xs",
              hasImages ? "text-white" : "text-primary",
            )}
          >
            TCG Store · Indonesia
          </p>
          <p
            className={cn(
              "mt-5 max-w-md text-base",
              hasImages ? "text-white/70" : "text-muted-foreground",
            )}
          >
            One Piece &amp; Pokémon English raw and graded singles. Authentic cards shipped across Indonesia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5",
                hasImages
                  ? "bg-white text-black"
                  : "bg-primary text-primary-foreground",
              )}
            >
              Browse Collection →
            </Link>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all",
                hasImages
                  ? "border-white/50 bg-white/10 text-white hover:bg-white/20"
                  : "border-border bg-transparent hover:bg-muted",
              )}
            >
              @mitra.tcg
            </a>
          </div>
        </div>

        {/* Card fan — shown when card images are configured in settings */}
        {hasCards && (
          <div className="relative hidden lg:block h-[680px]">
            {cardImages[2] && (
              <div className="absolute bottom-[18%] left-1/2 z-10 w-64 origin-bottom -translate-x-[30%] rotate-[13deg] shadow-xl transition-transform duration-300 ease-out hover:-translate-y-4 hover:shadow-2xl">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900">
                  <Image src={cardImages[2]} alt="Trading card" fill sizes="256px" className="object-cover" />
                </div>
              </div>
            )}
            {cardImages[1] && (
              <div className="absolute bottom-[18%] left-1/2 z-20 w-64 origin-bottom -translate-x-[70%] rotate-[-15deg] shadow-xl transition-transform duration-300 ease-out hover:-translate-y-4 hover:shadow-2xl">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900">
                  <Image src={cardImages[1]} alt="Trading card" fill sizes="256px" className="object-cover" />
                </div>
              </div>
            )}
            <div className="absolute bottom-[18%] left-1/2 z-30 w-72 -translate-x-1/2 shadow-2xl transition-transform duration-300 ease-out hover:-translate-y-5 hover:scale-[1.03]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
                <Image src={cardImages[0]} alt="Trading card" fill sizes="288px" className="object-cover" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide indicators */}
      {hasImages && backgroundImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {backgroundImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
