"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { productSchema, type ProductFormData } from "@/features/products/schemas"
import { createProductAction, updateProductAction, deleteProductAction } from "@/features/products/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { ImageUploader } from "@/components/dashboard/image-uploader"
import type { Product } from "@/features/products/types"
import type { FlatCategory } from "@/features/categories/types"

interface ProductFormProps {
  product?: Product
  flatCategories: FlatCategory[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function ProductForm({ product, flatCategories }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      images: product?.images ?? [],
      categoryId: product?.categoryId ?? flatCategories[0]?.id ?? "",
      sold: product?.sold ?? false,
      featured: product?.featured ?? false,
      published: product?.published ?? false,
    },
  })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("name", e.target.value)
    if (!product) {
      setValue("slug", slugify(e.target.value))
    }
  }

  function onSubmit(data: ProductFormData) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => {
        if (key === "images") return
        if (val !== null && val !== undefined) formData.set(key, String(val))
      })
      data.images.forEach((url) => formData.append("images", url))

      if (product) {
        const result = await updateProductAction(product.id, formData)
        if (result?.error) {
          toast.error("Failed to update product")
        } else {
          toast.success("Product updated")
        }
      } else {
        await createProductAction(formData)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: images */}
      <div className="border-2 border-foreground p-6 lg:col-span-2">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Images</h2>
        <ImageUploader
          initialUrls={product?.images ?? []}
          onChange={(urls) => setValue("images", urls)}
        />
        {errors.images && (
          <p className="mt-2 text-xs text-destructive">{errors.images.message}</p>
        )}
      </div>

      {/* Right: details */}
      <div className="space-y-6">
        <div className="space-y-4 border-2 border-foreground p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide">Details</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              onChange={handleNameChange}
              placeholder="Monkey D. Luffy Alt Art"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} placeholder="Describe the card..." />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              defaultValue={product?.categoryId ?? flatCategories[0]?.id ?? ""}
              onValueChange={(v) => setValue("categoryId", v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {flatCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span style={{ paddingLeft: cat.depth * 16 }}>
                      {" ".repeat(cat.depth * 2)}{cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-3 border-t border-foreground/10 pt-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                defaultChecked={product?.featured ?? false}
                onCheckedChange={(v) => setValue("featured", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="published">Published</Label>
              <Switch
                id="published"
                defaultChecked={product?.published ?? false}
                onCheckedChange={(v) => setValue("published", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sold">Sold</Label>
              <Switch
                id="sold"
                defaultChecked={product?.sold ?? false}
                onCheckedChange={(v) => setValue("sold", v)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" className="site-btn-primary w-full" disabled={isPending}>
            {isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>

          {product && (
            <AlertDialog>
              <AlertDialogTrigger className="inline-flex w-full items-center justify-center gap-2 border-2 border-destructive/30 bg-transparent px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Delete Product
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{product.name}&rdquo;. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => startTransition(async () => { await deleteProductAction(product.id) })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </form>
  )
}
