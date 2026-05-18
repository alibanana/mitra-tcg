"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { importFromPSAAction } from "@/features/products/actions"
import type { FlatCategory } from "@/features/categories/types"

interface AddProductModalProps {
  flatCategories: FlatCategory[]
}

export function AddProductModal({ flatCategories }: AddProductModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [certId, setCertId] = useState("")
  const [categoryId, setCategoryId] = useState(flatCategories[0]?.id ?? "")
  const [isPending, startTransition] = useTransition()

  function handleManual() {
    setOpen(false)
    router.push("/dashboard/products/new")
  }

  function handleImport() {
    if (!certId.trim()) {
      toast.error("Please enter a PSA cert ID")
      return
    }
    if (!categoryId) {
      toast.error("Please select a category")
      return
    }

    startTransition(async () => {
      const result = await importFromPSAAction(certId.trim(), categoryId)
      if ("error" in result) {
        toast.error(result.error)
        return
      }

      setOpen(false)
      setCertId("")

      const { jobId } = result
      localStorage.setItem(
        "psa_pending_import",
        JSON.stringify({ jobId, startedAt: Date.now() }),
      )
      window.dispatchEvent(new CustomEvent("psa-import-started", { detail: { jobId } }))
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
              Auto-import a graded card using its PSA cert number.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide">PSA Cert ID</Label>
                <Input
                  placeholder="e.g. 154761151"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                  disabled={isPending}
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
                disabled={isPending || !certId.trim() || !categoryId}
              >
                {isPending ? "Importing..." : "Import Product"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
