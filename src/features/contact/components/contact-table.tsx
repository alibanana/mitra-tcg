"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { bulkDeleteContactsAction } from "@/features/contact/actions"
import type { ContactSubmission } from "@/features/contact/types"

interface ContactTableProps {
  submissions: ContactSubmission[]
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ContactTable({ submissions }: ContactTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const allSelected = submissions.length > 0 && selectedIds.size === submissions.length
  const someSelected = selectedIds.size > 0 && !allSelected

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(submissions.map((s) => s.id)))
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function promptDelete(ids: string[]) {
    setPendingIds(ids)
    setDialogOpen(true)
  }

  function confirmDelete() {
    setDialogOpen(false)
    const ids = pendingIds
    startTransition(async () => {
      const result = await bulkDeleteContactsAction(ids)
      if ("error" in result) {
        toast.error("Failed to delete")
        return
      }
      setSelectedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      toast.success(ids.length === 1 ? "Submission deleted" : `${ids.length} submissions deleted`)
      router.refresh()
    })
  }

  return (
    <>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 border-2 border-foreground bg-muted px-4 py-2.5">
          <span className="flex-1 text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? "submission" : "submissions"} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-foreground text-xs font-bold uppercase tracking-wide"
            onClick={() => setSelectedIds(new Set())}
            disabled={isPending}
          >
            Deselect all
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-destructive text-xs font-bold uppercase tracking-wide text-destructive-foreground hover:bg-destructive/90"
            onClick={() => promptDelete([...selectedIds])}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete {selectedIds.size} selected
          </Button>
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-2">
        {submissions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No contact submissions yet.</p>
        )}
        {submissions.map((s) => (
          <div
            key={s.id}
            className={`border-2 border-foreground p-4 space-y-2 ${selectedIds.has(s.id) ? "bg-muted/30" : ""}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
                checked={selectedIds.has(s.id)}
                onChange={() => toggleOne(s.id)}
                aria-label={`Select ${s.name}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{s.name}</span>
                  <Badge variant={s.read ? "secondary" : "default"} className="shrink-0">
                    {s.read ? "Read" : "New"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.email}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => promptDelete([s.id])}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={toggleAll}
                  aria-label="Select all submissions"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Message</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-foreground/10">
            {submissions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No contact submissions yet.
                </td>
              </tr>
            )}
            {submissions.map((s) => (
              <tr
                key={s.id}
                className={`hover:bg-muted/50 ${selectedIds.has(s.id) ? "bg-muted/30" : ""}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleOne(s.id)}
                    aria-label={`Select ${s.name}`}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3 max-w-xs">
                  <span className="block truncate text-muted-foreground">{s.message}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={s.read ? "secondary" : "default"}>
                    {s.read ? "Read" : "New"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => promptDelete([s.id])}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={(open) => !isPending && setDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingIds.length === 1 ? "this submission" : `${pendingIds.length} submissions`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
