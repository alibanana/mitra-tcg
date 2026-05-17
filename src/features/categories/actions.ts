"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { slugify } from "@/lib/utils"
import { categoriesService } from "./services"
import { categoriesRepository } from "./repositories"

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  return session
}

function revalidateAll() {
  revalidatePath("/dashboard/categories")
  revalidatePath("/")
  revalidatePath("/products")
}

// ─── Inline add (always creates L1) ─────────────────────────────────────────

export async function addInlineCategoryAction(
  name: string,
): Promise<{ id: string; name: string; slug: string } | { error: string }> {
  await requireAuth()

  const trimmedName = name.trim()
  if (!trimmedName) return { error: "Name is required" }

  try {
    const cat = await categoriesService.createCategory({ name: trimmedName, parentId: null, sortOrder: 0 })
    revalidateAll()
    return { id: cat.id, name: cat.name, slug: cat.slug }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Inline name update ──────────────────────────────────────────────────────

export async function updateCategoryNameAction(
  id: string,
  name: string,
): Promise<{ slug?: string; error?: string }> {
  await requireAuth()

  const trimmedName = name.trim()
  if (!trimmedName) return { error: "Name is required" }

  try {
    const cat = await categoriesRepository.findById(id)
    if (!cat) return { error: "Category not found" }

    const nameSlug = slugify(trimmedName)
    let newSlug = nameSlug

    if (cat.parentId) {
      const parent = await categoriesRepository.findById(cat.parentId)
      if (parent) newSlug = `${parent.slug}-${nameSlug}`
    }

    await categoriesRepository.update(id, { name: trimmedName, slug: newSlug })
    revalidateAll()
    return { slug: newSlug }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Move with slug regeneration ─────────────────────────────────────────────

export async function moveCategoryAction(
  updates: { id: string; parentId: string | null; sortOrder: number }[],
) {
  await requireAuth()

  // Fetch current DB state for all items to detect parentId changes
  const dbItems = await Promise.all(updates.map((u) => categoriesRepository.findById(u.id)))
  const dbMap = new Map(updates.map((u, i) => [u.id, dbItems[i]]))

  // Identify items whose parentId changed
  const movedIds = new Set<string>()
  for (const update of updates) {
    const existing = dbMap.get(update.id)
    if (existing && existing.parentId !== update.parentId) movedIds.add(update.id)
  }

  // Build new slugs for moved items and their descendants (parent-before-child order)
  const slugMap = new Map<string, string>()

  for (const update of updates) {
    const existing = dbMap.get(update.id)
    if (!existing) continue

    const parentSlugChanged = update.parentId ? slugMap.has(update.parentId) : false
    if (!movedIds.has(update.id) && !parentSlugChanged) continue

    const nameSlug = slugify(existing.name)
    const parentSlug = update.parentId
      ? (slugMap.get(update.parentId) ?? dbMap.get(update.parentId)?.slug ?? "")
      : null
    slugMap.set(update.id, parentSlug ? `${parentSlug}-${nameSlug}` : nameSlug)
  }

  const fullUpdates = updates.map((u) => ({ ...u, slug: slugMap.get(u.id) }))
  await categoriesRepository.updatePositions(fullUpdates)
  revalidateAll()
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  await requireAuth()

  try {
    await categoriesService.deleteCategory(id)
  } catch (e) {
    return { error: (e as Error).message }
  }

  revalidateAll()
  return {}
}
