"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useEffect, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FlatCategory } from "@/features/categories/types"

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "oldest",    label: "Oldest First" },
  { value: "name_asc",  label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
]

interface ProductFiltersProps {
  categories: FlatCategory[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Applied state (mirrors the URL)
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "all")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest")
  const debouncedSearch = useDebounce(search, 300)

  // Mobile modal staged state — only committed on Apply
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingCategory, setPendingCategory] = useState("all")
  const [pendingSort, setPendingSort] = useState("newest")

  // Seed pending state from applied state each time modal opens
  useEffect(() => {
    if (modalOpen) {
      setPendingCategory(category)
      setPendingSort(sort)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen])

  // Keep applied state in sync on back/forward navigation
  useEffect(() => {
    setCategory(searchParams.get("category") ?? "all")
    setSort(searchParams.get("sort") ?? "newest")
  }, [searchParams])

  // Search applies immediately via debounce
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) params.set("search", debouncedSearch)
    else params.delete("search")
    params.delete("page")
    startTransition(() => router.push(`/products?${params.toString()}`))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const activeFilterCount = [category !== "all", sort !== "newest"].filter(Boolean).length
  const hasPendingFilters = pendingCategory !== "all" || pendingSort !== "newest"

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== "all" && value !== "newest") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    params.delete("page")
    return `/products?${params.toString()}`
  }

  // Desktop: applies immediately
  function applyParam(key: string, value: string) {
    if (key === "category") setCategory(value)
    if (key === "sort") setSort(value)
    startTransition(() => router.push(buildUrl({ [key]: value })))
  }

  // Mobile modal: applies both at once
  function applyModalFilters() {
    setCategory(pendingCategory)
    setSort(pendingSort)
    startTransition(() => router.push(buildUrl({ category: pendingCategory, sort: pendingSort })))
    setModalOpen(false)
  }

  function clearModalFilters() {
    setPendingCategory("all")
    setPendingSort("newest")
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Search — always visible */}
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-[240px]"
      />

      {/* Mobile: single Filters & Sort button */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            "relative flex h-11 shrink-0 items-center gap-1.5 border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent sm:hidden",
            activeFilterCount > 0 && "border-foreground",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters &amp; Sort</span>
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
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Category
              </label>
              <Select value={pendingCategory} onValueChange={setPendingCategory}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue>
                    {(v: string) =>
                      v === "all" || !v
                        ? "All Categories"
                        : (categories.find((c) => c.slug === v)?.name ?? v)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
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
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Sort
              </label>
              <Select value={pendingSort} onValueChange={setPendingSort}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue>
                    {(v: string) => SORT_OPTIONS.find((o) => o.value === v)?.label ?? "Newest First"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {hasPendingFilters && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={clearModalFilters}>
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            <Button onClick={applyModalFilters}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop: inline dropdowns */}
      <div className="hidden sm:flex sm:items-center sm:gap-4">
        <Select value={category} onValueChange={(v) => applyParam("category", v)}>
          <SelectTrigger className="!h-11 w-[220px]">
            <SelectValue>
              {(v: string) =>
                v === "all" || !v
                  ? "All Categories"
                  : (categories.find((c) => c.slug === v)?.name ?? v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                <span style={{ paddingLeft: cat.depth * 12 }}>
                  {cat.depth > 0 ? "↳ " : ""}{cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => applyParam("sort", v)}>
          <SelectTrigger className="!h-11 w-[180px]">
            <SelectValue>
              {(v: string) => SORT_OPTIONS.find((o) => o.value === v)?.label ?? "Newest First"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
