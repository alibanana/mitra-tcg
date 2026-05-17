"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { X, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  initialUrls?: string[]
  name?: string
  onChange?: (urls: string[]) => void
  maxImages?: number
}

export function ImageUploader({ initialUrls = [], name, onChange, maxImages }: ImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const atMax = maxImages !== undefined && urls.length >= maxImages

  function update(next: string[]) {
    setUrls(next)
    onChange?.(next)
  }

  function remove(url: string) {
    update(urls.filter((u) => u !== url))
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    const toUpload = Array.from(files).slice(0, maxImages ? maxImages - urls.length : undefined)
    setUploading(true)

    const uploaded: string[] = []
    for (const file of toUpload) {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        setError("One or more files failed to upload.")
        break
      }
      const json = await res.json()
      uploaded.push(json.data.url)
    }

    update([...urls, ...uploaded])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      {name && <input type="hidden" name={name} value={JSON.stringify(urls)} />}

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url) => (
            <div key={url} className="group relative h-20 w-20 shrink-0 overflow-hidden border-2 border-foreground">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!atMax && (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/40 p-6 transition-colors hover:border-foreground hover:bg-muted/30",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Click to upload{maxImages === 1 ? " an image" : " images"}
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={maxImages !== 1}
            className="sr-only"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
