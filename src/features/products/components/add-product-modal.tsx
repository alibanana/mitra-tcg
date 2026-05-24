"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { bulkImportFromPSAAction } from "@/features/products/actions"
import type { FlatCategory } from "@/features/categories/types"

interface AddProductModalProps {
  flatCategories: FlatCategory[]
}

function parseCertIds(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function AddProductModal({ flatCategories }: AddProductModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [certInput, setCertInput] = useState("")
  const [categoryId, setCategoryId] = useState(flatCategories[0]?.id ?? "")
  const [isPending, startTransition] = useTransition()

  const certIds = parseCertIds(certInput)
  const count = certIds.length

  function handleManual() {
    setOpen(false)
    router.push("/dashboard/products/new")
  }

  function handleImport() {
    if (count === 0) {
      toast.error("Please enter at least one PSA cert ID")
      return
    }
    if (!categoryId) {
      toast.error("Please select a category")
      return
    }

    startTransition(async () => {
      const result = await bulkImportFromPSAAction(certIds, categoryId)
      if ("error" in result) {
        toast.error(result.error)
        return
      }

      setOpen(false)
      setCertInput("")

      // Persist jobs so they survive a page refresh
      const stored = result.jobs.map((j) => ({ ...j, startedAt: Date.now() }))
      const existing = JSON.parse(localStorage.getItem("psa_bulk_import") ?? "[]")
      localStorage.setItem("psa_bulk_import", JSON.stringify([...existing, ...stored]))

      window.dispatchEvent(
        new CustomEvent("psa-import-started", { detail: { jobs: result.jobs } }),
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="site-btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Manual */}
          <div className="flex flex-col border-2 border-foreground p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide">Manual</p>
            <p className="mb-5 flex-1 text-sm text-muted-foreground">
              Create a product from scratch with full control over all fields.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 border-2 border-foreground"
              onClick={handleManual}
              disabled={isPending}
            >
              Go to form
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* PSA Import */}
          <div className="flex flex-col border-2 border-foreground p-5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              PSA Import
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Auto-import graded cards by PSA cert number. Enter one per line for bulk import.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wide">PSA Cert IDs</Label>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "cert" : "certs"}
                    </span>
                  )}
                </div>
                <Textarea
                  placeholder={"154761151\n154761152\n154761153"}
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  disabled={isPending}
                  rows={4}
                  className="resize-none font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide">Category</Label>
                <Select
                  value={categoryId}
                  onValueChange={(v) => setCategoryId(v ?? "")}
                  disabled={isPending}
                  itemToStringLabel={(v) => flatCategories.find((c) => c.id === v)?.name ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} label={cat.name}>
                        <span style={{ paddingLeft: cat.depth * 12 }}>{cat.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="site-btn-primary w-full"
                onClick={handleImport}
                disabled={isPending || count === 0 || !categoryId}
              >
                {isPending
                  ? "Queuing imports…"
                  : count > 1
                    ? `Import ${count} Products`
                    : "Import Product"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
