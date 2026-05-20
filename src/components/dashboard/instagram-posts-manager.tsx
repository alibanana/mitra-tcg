"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateInstagramPostsAction } from "@/features/settings/actions"

function extractPostId(input: string): string | null {
  const trimmed = input.trim()
  const match = trimmed.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  if (match) return match[1]
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed
  return null
}

interface InstagramPostsManagerProps {
  initialPostIds: string[]
}

export function InstagramPostsManager({ initialPostIds }: InstagramPostsManagerProps) {
  const [postIds, setPostIds] = useState<string[]>(initialPostIds)
  const [inputValue, setInputValue] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    const id = extractPostId(inputValue)
    if (!id) {
      toast.error("Invalid URL or post ID")
      return
    }
    if (postIds.includes(id)) {
      toast.error("Post already added")
      return
    }
    const next = [...postIds, id]
    setPostIds(next)
    setInputValue("")
    save(next)
  }

  function handleRemove(id: string) {
    const next = postIds.filter((p) => p !== id)
    setPostIds(next)
    save(next)
  }

  function save(ids: string[]) {
    startTransition(async () => {
      const result = await updateInstagramPostsAction(ids)
      if (result?.error) {
        toast.error("Failed to save")
      } else {
        toast.success("Saved")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="https://www.instagram.com/p/ABC123/ or post ID"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button type="button" onClick={handleAdd} disabled={isPending || !inputValue.trim()}>
          Add
        </Button>
      </div>

      {postIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts added yet.</p>
      ) : (
        <ul className="space-y-2">
          {postIds.map((id, i) => (
            <li key={id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-muted-foreground">{i + 1}.</span>
                <a
                  href={`https://www.instagram.com/p/${id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-blue-600 hover:underline"
                >
                  instagram.com/p/{id}
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(id)}
                disabled={isPending}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      {isPending && <p className="text-xs text-muted-foreground">Saving…</p>}
      <p className="text-xs text-muted-foreground">{postIds.length} post{postIds.length !== 1 ? "s" : ""} configured</p>
    </div>
  )
}
