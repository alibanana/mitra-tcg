"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  filename: string
  url: string
  mimeType: string
}

interface MediaGridProps {
  items: MediaItem[]
  onDelete?: (id: string) => void
  selectable?: boolean
  selectedUrls?: string[]
  onSelect?: (url: string) => void
}

export function MediaGrid({ items, onDelete, selectable, selectedUrls = [], onSelect }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center border-2 border-dashed border-foreground/30">
        <p className="text-sm text-muted-foreground">No media files yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => {
        const isSelected = selectedUrls.includes(item.url)
        return (
          <div
            key={item.id}
            className={cn(
              "group relative overflow-hidden border-2 bg-muted transition-all",
              selectable
                ? cn(
                    "cursor-pointer",
                    isSelected
                      ? "border-primary shadow-[3px_3px_0_var(--primary)]"
                      : "border-foreground/30 hover:border-foreground",
                  )
                : "border-foreground/30",
            )}
            title={item.filename}
            onClick={() => selectable && onSelect?.(item.url)}
          >
            <div className="aspect-square">
              {item.mimeType.startsWith("image/") ? (
                <Image src={item.url} alt={item.filename} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-2">
                  <p className="truncate text-xs text-muted-foreground">{item.filename}</p>
                </div>
              )}
            </div>

            {selectable && isSelected && (
              <div className="absolute right-1.5 top-1.5">
                <CheckCircle2 className="h-5 w-5 text-primary drop-shadow" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-background/90 p-1.5 transition-transform group-hover:translate-y-0">
              <p className="truncate text-xs text-foreground">{item.filename}</p>
            </div>

            {onDelete && !selectable && (
              <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
