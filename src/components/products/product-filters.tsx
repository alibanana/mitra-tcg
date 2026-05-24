"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { FlatCategory } from "@/features/categories/types"

interface ProductFiltersProps {
  categories: FlatCategory[]
}

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "oldest",    label: "Oldest First" },
  { value: "name_asc",  label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
]

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "all")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest")
  const debouncedSearch = useDebounce(search, 300)

  function updateParam(key: string, value: string | null) {
    if (value === null) return
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all" && value !== "newest") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() => router.push(`/products?${params.toString()}`))
  }

  useEffect(() => {
    updateParam("search", debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  useEffect(() => {
    setCategory(searchParams.get("category") ?? "all")
    setSort(searchParams.get("sort") ?? "newest")
  }, [searchParams])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-[240px]"
      />

      <Select
        value={category}
        onValueChange={(v) => { setCategory(v ?? "all"); updateParam("category", v) }}
      >
        <SelectTrigger className="!h-11 sm:w-[220px]">
          <SelectValue>
            {(v: string) => v === "all" || !v
              ? "All Categories"
              : (categories.find(c => c.slug === v)?.name ?? v)}
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

      <Select
        value={sort}
        onValueChange={(v) => { setSort(v); updateParam("sort", v) }}
      >
        <SelectTrigger className="!h-11 sm:w-[180px]">
          <SelectValue>
            {(v: string) => SORT_OPTIONS.find(o => o.value === v)?.label ?? "Newest First"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
