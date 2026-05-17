"use client"

import React, { useState, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Check, X, Trash2, Plus } from "lucide-react"
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
import { toast } from "sonner"
import {
  moveCategoryAction,
  addInlineCategoryAction,
  updateCategoryNameAction,
  deleteCategoryAction,
} from "@/features/categories/actions"
import type { CategoryWithChildren } from "@/features/categories/types"

const INDENT_WIDTH = 40

interface FlatItem {
  id: string
  name: string
  slug: string
  depth: number
  parentId: string | null
}

function buildFlat(
  tree: CategoryWithChildren[],
  depth = 0,
  parentId: string | null = null,
): FlatItem[] {
  const result: FlatItem[] = []
  for (const cat of tree) {
    result.push({ id: cat.id, name: cat.name, slug: cat.slug, depth, parentId })
    if (cat.children?.length) result.push(...buildFlat(cat.children, depth + 1, cat.id))
  }
  return result
}

function getSubtreeIds(flat: FlatItem[], id: string): string[] {
  const idx = flat.findIndex((c) => c.id === id)
  if (idx === -1) return [id]
  const rootDepth = flat[idx].depth
  const ids = [id]
  for (let i = idx + 1; i < flat.length; i++) {
    if (flat[i].depth <= rootDepth) break
    ids.push(flat[i].id)
  }
  return ids
}

function getMaxSubtreeRelativeDepth(flat: FlatItem[], id: string): number {
  const idx = flat.findIndex((c) => c.id === id)
  if (idx === -1) return 0
  const baseDepth = flat[idx].depth
  let maxRelative = 0
  for (let i = idx + 1; i < flat.length; i++) {
    if (flat[i].depth <= baseDepth) break
    maxRelative = Math.max(maxRelative, flat[i].depth - baseDepth)
  }
  return maxRelative
}

function inferParentId(flat: FlatItem[], insertIdx: number, depth: number): string | null {
  if (depth === 0) return null
  for (let i = insertIdx - 1; i >= 0; i--) {
    if (flat[i].depth === depth - 1) return flat[i].id
    if (flat[i].depth < depth - 1) break
  }
  return null
}

function computeProjectedDepth(flat: FlatItem[], activeId: string, deltaX: number): number {
  const activeItem = flat.find((c) => c.id === activeId)
  if (!activeItem) return 0
  const depthOffset = Math.round(deltaX / INDENT_WIDTH)
  const maxRelative = getMaxSubtreeRelativeDepth(flat, activeId)
  const maxDepth = 2 - maxRelative
  return Math.max(0, Math.min(maxDepth, activeItem.depth + depthOffset))
}

function moveSubtree(
  flat: FlatItem[],
  activeId: string,
  overId: string,
  targetDepth: number,
): FlatItem[] {
  const activeIdx = flat.findIndex((c) => c.id === activeId)
  const overIdx = flat.findIndex((c) => c.id === overId)
  if (activeIdx === -1 || overIdx === -1) return flat

  const activeDepth = flat[activeIdx].depth
  const subtreeIdSet = new Set(getSubtreeIds(flat, activeId))
  const subtree = flat.filter((c) => subtreeIdSet.has(c.id))
  const without = flat.filter((c) => !subtreeIdSet.has(c.id))

  const newOverIdx = without.findIndex((c) => c.id === overId)
  const movingDown = activeIdx < overIdx

  let insertAt: number
  let effectiveDepth = targetDepth
  let newParentId: string | null = null

  if (targetDepth > activeDepth) {
    // Nesting: scan backward from the active item's position to find the nearest
    // ancestor at the desired depth. We ignore overId here because closestCenter
    // uses 2-D distance and often returns a sibling instead of the intended parent
    // when the drag is primarily horizontal (e.g. Yugioh instead of Accessories).
    let foundParent: FlatItem | undefined

    while (effectiveDepth > activeDepth && !foundParent) {
      for (let i = activeIdx - 1; i >= 0; i--) {
        if (!subtreeIdSet.has(flat[i].id) && flat[i].depth === effectiveDepth - 1) {
          foundParent = flat[i]
          break
        }
      }
      if (!foundParent) effectiveDepth--
    }

    if (foundParent) {
      newParentId = foundParent.id
      // Insert at end of parent's existing children in `without`
      const pIdx = without.findIndex((c) => c.id === foundParent!.id)
      let lastChild = pIdx
      while (lastChild + 1 < without.length && without[lastChild + 1].depth > effectiveDepth - 1) {
        lastChild++
      }
      insertAt = lastChild + 1
    } else {
      // No ancestor above — fall back to plain reorder at current depth
      effectiveDepth = activeDepth
      insertAt = movingDown ? newOverIdx + 1 : newOverIdx
    }
  } else {
    // Reorder or un-nest: position relative to over item, then walk depth down until
    // a valid parent is found.
    insertAt = movingDown ? newOverIdx + 1 : newOverIdx
    while (effectiveDepth > 0) {
      newParentId = inferParentId([...without.slice(0, insertAt)], insertAt, effectiveDepth)
      if (newParentId !== null) break
      effectiveDepth--
    }
  }

  const depthDelta = effectiveDepth - activeDepth
  const movedSubtree = subtree.map((item, i) => ({
    ...item,
    parentId: i === 0 ? newParentId : item.parentId,
    depth: item.depth + depthDelta,
  }))

  const result = [...without]
  result.splice(insertAt, 0, ...movedSubtree)
  return result
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SortableRow({
  item,
  isEditing,
  editValue,
  onEditValueChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}: {
  item: FlatItem
  isEditing: boolean
  editValue: string
  onEditValueChange: (v: string) => void
  onEditStart: () => void
  onEditSave: () => void
  onEditCancel: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isEditing,
  })

  const VISUAL_INDENT = 20 // visual indentation uses the original 20px spacing

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 10 : "auto",
        position: "relative",
      }}
      className="flex items-center gap-2 border-b border-border px-4 py-2 last:border-0 hover:bg-muted/20"
    >
      <div style={{ width: item.depth * VISUAL_INDENT, flexShrink: 0 }} />

      {isEditing ? (
        <div className="w-4 shrink-0" />
      ) : (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {item.depth > 0 && (
        <span className="shrink-0 text-muted-foreground text-xs">└─</span>
      )}

      {isEditing ? (
        <>
          <input
            autoFocus
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onEditSave() }
              if (e.key === "Escape") onEditCancel()
            }}
            className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-foreground"
          />
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
            onClick={onEditSave} disabled={!editValue.trim()}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
            onClick={onEditCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 cursor-text text-sm font-medium" onClick={onEditStart}>
            {item.name}
          </span>
          <span className="hidden w-40 font-mono text-xs text-muted-foreground sm:block">
            {item.slug}
          </span>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"
            onClick={onEditStart}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  )
}

function OverlayRow({ item, depth }: { item: FlatItem; depth: number }) {
  const VISUAL_INDENT = 20
  return (
    <div
      className="flex items-center gap-2 border border-foreground bg-background px-4 py-2 shadow-[4px_4px_0px_0px] shadow-foreground"
      style={{ opacity: 0.95 }}
    >
      <div style={{ width: depth * VISUAL_INDENT, flexShrink: 0 }} />
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {depth > 0 && <span className="shrink-0 text-muted-foreground text-xs">└─</span>}
      <span className="flex-1 text-sm font-medium">{item.name}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DraggableCategoryList({ initialTree }: { initialTree: CategoryWithChildren[] }) {
  const [, startTransition] = useTransition()
  const [flat, setFlat] = useState(() => buildFlat(initialTree))

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overlayDeltaX, setOverlayDeltaX] = useState(0)

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  // Inline add
  const [isAdding, setIsAdding] = useState(false)
  const [addValue, setAddValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const projectedDepth = activeId ? computeProjectedDepth(flat, activeId, overlayDeltaX) : 0
  const activeItem = activeId ? flat.find((c) => c.id === activeId) : null
  const deleteItem = deleteId ? flat.find((c) => c.id === deleteId) : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
    setOverlayDeltaX(0)
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOverlayDeltaX(delta.x)
  }

  function handleDragEnd({ active, over, delta }: DragEndEvent) {
    setActiveId(null)
    setOverlayDeltaX(0)

    if (!over || active.id === over.id) return

    const targetDepth = computeProjectedDepth(flat, String(active.id), delta.x)
    const newFlat = moveSubtree(flat, String(active.id), String(over.id), targetDepth)
    setFlat(newFlat)

    const grouped = new Map<string | null, string[]>()
    for (const item of newFlat) {
      if (!grouped.has(item.parentId)) grouped.set(item.parentId, [])
      grouped.get(item.parentId)!.push(item.id)
    }
    const updates = newFlat.map((item) => ({
      id: item.id,
      parentId: item.parentId,
      sortOrder: (grouped.get(item.parentId) ?? []).indexOf(item.id),
    }))

    startTransition(() => moveCategoryAction(updates))
  }

  function startEditing(item: FlatItem) {
    setEditingId(item.id)
    setEditValue(item.name)
  }

  async function handleEditSave() {
    if (!editingId || !editValue.trim() || isSaving) return
    setIsSaving(true)
    try {
      const result = await updateCategoryNameAction(editingId, editValue)
      if (result.error) { toast.error(result.error); return }
      setFlat((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name: editValue.trim(), slug: result.slug ?? item.slug }
            : item,
        ),
      )
      setEditingId(null)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAdd() {
    if (!addValue.trim() || isSaving) return
    setIsSaving(true)
    try {
      const result = await addInlineCategoryAction(addValue)
      if ("error" in result) { toast.error(result.error); return }
      setFlat((prev) => [
        ...prev,
        { id: result.id, name: result.name, slug: result.slug, depth: 0, parentId: null },
      ])
      setAddValue("")
      setIsAdding(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId || isSaving) return
    setIsSaving(true)
    try {
      const result = await deleteCategoryAction(deleteId)
      if (result.error) { toast.error(result.error); setDeleteId(null); return }
      const subtreeIds = getSubtreeIds(flat, deleteId)
      setFlat((prev) => prev.filter((item) => !subtreeIds.includes(item.id)))
      setDeleteId(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {(flat.length > 0 || isAdding) && (
        <DndContext
          id="categories-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flat.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {flat.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                editValue={editingId === item.id ? editValue : item.name}
                onEditValueChange={setEditValue}
                onEditStart={() => startEditing(item)}
                onEditSave={handleEditSave}
                onEditCancel={() => setEditingId(null)}
                onDelete={() => setDeleteId(item.id)}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeItem ? <OverlayRow item={activeItem} depth={projectedDepth} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Inline add row */}
      {isAdding ? (
        <div className="flex items-center gap-2 border-t border-border px-4 py-2">
          <div className="w-4 shrink-0" />
          <input
            autoFocus
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleAdd() }
              if (e.key === "Escape") { setIsAdding(false); setAddValue("") }
            }}
            placeholder="Category name..."
            className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-foreground"
          />
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
            onClick={handleAdd} disabled={!addValue.trim() || isSaving}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
            onClick={() => { setIsAdding(false); setAddValue("") }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/20 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open: boolean) => { if (!open) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteItem?.name}&rdquo;. Categories with
              products or subcategories cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isSaving}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
