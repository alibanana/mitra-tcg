"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { ProductThumbnail } from "@/components/dashboard/product-thumbnail"
import { cn } from "@/lib/utils"
import { bulkDeleteProductsAction } from "@/features/products/actions"

interface TableProduct {
  id: string
  name: string
  images: string[]
  category: { name: string }
  published: boolean
}

interface ProductTableProps {
  products: TableProduct[]
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const someSelected = selectedIds.size > 0 && !allSelected

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(products.map((p) => p.id)))
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
      const result = await bulkDeleteProductsAction(ids)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      setSelectedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      toast.success(ids.length === 1 ? "Product deleted" : `${ids.length} products deleted`)
      router.refresh()
    })
  }

  return (
    <>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 border-2 border-foreground bg-muted px-4 py-2.5">
          <span className="flex-1 text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? "product" : "products"} selected
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

      <div className="overflow-x-auto border-2 border-foreground">
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
                  aria-label="Select all products"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Product</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-foreground/10">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No products yet. Add your first one!
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr
                key={product.id}
                className={cn("hover:bg-muted/50", selectedIds.has(product.id) && "bg-muted/30")}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <ProductThumbnail src={product.images[0]} alt={product.name} />
                    ) : (
                      <div
                        className="w-[192px] shrink-0 border border-foreground/20 bg-muted"
                        style={{ aspectRatio: "3/4" }}
                      />
                    )}
                    <span className="truncate font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{product.category.name}</td>
                <td className="px-4 py-3">
                  {product.published ? (
                    <span className="bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
                      Live
                    </span>
                  ) : (
                    <span className="border border-foreground/30 px-2 py-0.5 text-xs font-bold uppercase text-muted-foreground">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => promptDelete([product.id])}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shared confirmation dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={(open) => !isPending && setDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingIds.length === 1 ? "this product" : `${pendingIds.length} products`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All product images will also be permanently deleted.
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
