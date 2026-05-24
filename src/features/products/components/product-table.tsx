"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Loader2, Eye, EyeOff, X, SlidersHorizontal } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ProductThumbnail } from "@/components/dashboard/product-thumbnail"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { bulkDeleteProductsAction, bulkUpdateStatusAction, fetchProductsAction, type DashboardProductFilters } from "@/features/products/actions"
import type { FlatCategory } from "@/features/categories/types"

const PAGE_SIZE = 20

interface TableProduct {
  id: string
  name: string
  images: string[]
  category: { name: string }
  published: boolean
}

interface ProductTableProps {
  initialProducts: TableProduct[]
  total: number
  flatCategories: FlatCategory[]
}

export function ProductTable({ initialProducts, total: initialTotal, flatCategories }: ProductTableProps) {
  const router = useRouter()

  // Filter state
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<"all" | "published" | "unpublished">("all")
  const [sort, setSort] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest")
  const debouncedSearch = useDebounce(search, 300)

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  // Staged state for the mobile modal — only committed to real filters on "Apply"
  const [pendingCategory, setPendingCategory] = useState("")
  const [pendingStatus, setPendingStatus] = useState<"all" | "published" | "unpublished">("all")
  const [pendingSort, setPendingSort] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest")

  // Sync pending state from applied state each time the modal opens
  useEffect(() => {
    if (filterModalOpen) {
      setPendingCategory(category)
      setPendingStatus(status)
      setPendingSort(sort)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModalOpen])

  const hasActiveFilters = !!debouncedSearch || !!category || status !== "all" || sort !== "newest"
  const activeFilterCount = [!!category, status !== "all", sort !== "newest"].filter(Boolean).length
  const hasPendingFilters = !!pendingCategory || pendingStatus !== "all" || pendingSort !== "newest"

  function applyModalFilters() {
    setCategory(pendingCategory)
    setStatus(pendingStatus)
    setSort(pendingSort)
    setFilterModalOpen(false)
  }

  function clearModalFilters() {
    setPendingCategory("")
    setPendingStatus("all")
    setPendingSort("newest")
  }

  function clearFilters() {
    setSearch("")
    setCategory("")
    setStatus("all")
    setSort("newest")
  }

  // Product list state
  const [allProducts, setAllProducts] = useState<TableProduct[]>(initialProducts)
  const [totalCount, setTotalCount] = useState(initialTotal)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Refs to avoid stale closures
  const stateRef = useRef({ isLoading: false, loaded: initialProducts.length, total: initialTotal })
  const filtersRef = useRef<DashboardProductFilters>({})

  function buildFilters(): DashboardProductFilters {
    return {
      search: debouncedSearch || undefined,
      categoryId: category || undefined,
      status: status === "all" ? undefined : status,
      orderBy: sort === "name_asc" || sort === "name_desc" ? "name" : "createdAt",
      orderDir: sort === "oldest" || sort === "name_asc" ? "asc" : "desc",
    }
  }

  // Reset + load page 1 when filters change
  useEffect(() => {
    const filters = buildFilters()
    filtersRef.current = filters
    let cancelled = false

    async function load() {
      stateRef.current.isLoading = true
      setIsLoadingMore(true)
      setAllProducts([])
      setTotalCount(0)
      stateRef.current.loaded = 0
      try {
        const { items, total } = await fetchProductsAction(1, filters)
        if (cancelled) return
        setAllProducts(items as TableProduct[])
        setTotalCount(total)
        stateRef.current.loaded = items.length
        stateRef.current.total = total
      } finally {
        if (!cancelled) {
          stateRef.current.isLoading = false
          setIsLoadingMore(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, status, sort])

  const loadMore = useCallback(async () => {
    if (stateRef.current.isLoading) return
    if (stateRef.current.loaded >= stateRef.current.total) return
    stateRef.current.isLoading = true
    setIsLoadingMore(true)
    try {
      const nextPage = Math.floor(stateRef.current.loaded / PAGE_SIZE) + 1
      const { items, total } = await fetchProductsAction(nextPage, filtersRef.current)
      setAllProducts((prev) => {
        const next = [...prev, ...items] as TableProduct[]
        stateRef.current.loaded = next.length
        return next
      })
      stateRef.current.total = total
      setTotalCount(total)
    } finally {
      stateRef.current.isLoading = false
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    }, { rootMargin: "200px" })
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  const products = allProducts
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

  function handleBulkStatus(published: boolean) {
    const ids = [...selectedIds]
    startTransition(async () => {
      const result = await bulkUpdateStatusAction(ids, published)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      setAllProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, published } : p)),
      )
      toast.success(
        published
          ? `${ids.length} ${ids.length === 1 ? "product" : "products"} published`
          : `${ids.length} ${ids.length === 1 ? "product" : "products"} unpublished`,
      )
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
      {/* Filter bar */}
      <div className="mb-4 flex items-center gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 min-w-0 flex-1 sm:max-w-[200px] sm:flex-none"
        />

        {/* Mobile: single filter button */}
        <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <button
            onClick={() => setFilterModalOpen(true)}
            className={cn(
              "relative flex h-9 shrink-0 items-center gap-1.5 border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent sm:hidden",
              activeFilterCount > 0 && "border-foreground"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {activeFilterCount}
              </span>
            )}
          </button>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Filters &amp; Sort</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Category</label>
                <Select value={pendingCategory || "all"} onValueChange={(v) => setPendingCategory(!v || v === "all" ? "" : v)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>
                      {(v: string) => !v || v === "all" ? "All Categories" : flatCategories.find(c => c.slug === v)?.name ?? v}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        <span style={{ paddingLeft: cat.depth * 12 }}>
                          {cat.depth > 0 ? "↳ " : ""}{cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</label>
                <Select value={pendingStatus} onValueChange={(v) => setPendingStatus(v as typeof pendingStatus)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>
                      {(v: string) => v === "published" ? "Published" : v === "unpublished" ? "Draft" : "All Status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sort</label>
                <Select value={pendingSort} onValueChange={(v) => setPendingSort(v as typeof pendingSort)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>
                      {(v: string) => ({ newest: "Newest First", oldest: "Oldest First", name_asc: "Name A–Z", name_desc: "Name Z–A" }[v] ?? "Sort")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name_asc">Name A–Z</SelectItem>
                    <SelectItem value="name_desc">Name Z–A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              {hasPendingFilters && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={clearModalFilters}>
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
              <Button onClick={applyModalFilters}>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Desktop: inline dropdowns */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <Select value={category || "all"} onValueChange={(v) => setCategory(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue>
                {(v: string) => !v || v === "all" ? "All Categories" : flatCategories.find(c => c.slug === v)?.name ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {flatCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  <span style={{ paddingLeft: cat.depth * 12 }}>
                    {cat.depth > 0 ? "↳ " : ""}{cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue>
                {(v: string) => v === "published" ? "Published" : v === "unpublished" ? "Draft" : "All Status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue>
                {(v: string) => ({ newest: "Newest First", oldest: "Oldest First", name_asc: "Name A–Z", name_desc: "Name Z–A" }[v] ?? "Sort")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name_asc">Name A–Z</SelectItem>
              <SelectItem value="name_desc">Name Z–A</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          {totalCount} {totalCount === 1 ? "product" : "products"}
        </span>
      </div>

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
            variant="outline"
            size="sm"
            className="gap-1.5 border-2 border-foreground text-xs font-bold uppercase tracking-wide"
            onClick={() => handleBulkStatus(true)}
            disabled={isPending}
          >
            <Eye className="h-3.5 w-3.5" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-2 border-foreground text-xs font-bold uppercase tracking-wide"
            onClick={() => handleBulkStatus(false)}
            disabled={isPending}
          >
            <EyeOff className="h-3.5 w-3.5" />
            Unpublish
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
        {products.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No products yet. Add your first one!
          </p>
        )}
        {products.map((product) => (
          <div
            key={product.id}
            className={cn(
              "flex items-start gap-3 border-2 border-foreground p-3",
              selectedIds.has(product.id) && "bg-muted/30",
            )}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
              checked={selectedIds.has(product.id)}
              onChange={() => toggleOne(product.id)}
              aria-label={`Select ${product.name}`}
            />
            {product.images[0] ? (
              <ProductThumbnail src={product.images[0]} alt={product.name} className="w-12" sizes="48px" />
            ) : (
              <div className="w-12 shrink-0 border border-foreground/20 bg-muted" style={{ aspectRatio: "3/4" }} />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{product.category.name}</p>
              <div className="mt-1.5">
                {product.published ? (
                  <span className="bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
                    Live
                  </span>
                ) : (
                  <span className="border border-foreground/30 px-2 py-0.5 text-xs font-bold uppercase text-muted-foreground">
                    Draft
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
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
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-x-auto border-2 border-foreground md:block">
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

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-2 flex justify-center">
        {isLoadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
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
