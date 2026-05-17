export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
}

export interface FlatCategory extends Category {
  depth: number
}

export function flattenTree(cats: CategoryWithChildren[], depth = 0): FlatCategory[] {
  return cats.flatMap((cat) => [
    { ...cat, depth, children: undefined } as FlatCategory,
    ...flattenTree(cat.children ?? [], depth + 1),
  ])
}
