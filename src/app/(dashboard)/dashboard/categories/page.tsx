import { categoriesService } from "@/features/categories/services"
import { DraggableCategoryList } from "@/features/categories/components/draggable-category-list"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Categories" }

export default async function CategoriesPage() {
  const tree = await categoriesService.getCategoryTree().catch(() => [])
  const total = tree.reduce(
    (acc, root) =>
      acc + 1 + root.children.reduce((a, child) => a + 1 + child.children.length, 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} categories · drag to reorder · drag right/left to change level
        </p>
      </div>

      <div className="border-2 border-foreground">
        <div className="flex items-center gap-2 border-b-2 border-foreground bg-muted/40 px-4 py-3">
          <div className="w-6 shrink-0" />
          <span className="flex-1 text-xs font-bold uppercase tracking-wide">Name</span>
          <span className="hidden text-xs font-bold uppercase tracking-wide sm:block w-40">Slug</span>
          <div className="w-[72px]" />
        </div>

        <DraggableCategoryList initialTree={tree} />
      </div>
    </div>
  )
}
