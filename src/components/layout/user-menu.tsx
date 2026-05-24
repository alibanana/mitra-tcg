"use client"

import { useState, useTransition, type ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { KeyRound, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { changePasswordAction } from "@/features/users/actions"
import { cn } from "@/lib/utils"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

function PasswordInput({ placeholder, ...props }: ComponentProps<typeof Input> & { placeholder?: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} placeholder={placeholder} className="pr-9" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function AvatarInitials({ name, email }: { name?: string | null; email?: string | null }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : (email?.[0] ?? "U").toUpperCase()

  return (
    <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary text-xs font-bold text-primary-foreground">
      {initials}
    </div>
  )
}

export function UserMenu({
  name,
  email,
}: {
  name?: string | null
  email?: string | null
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  function handleDialogChange(open: boolean) {
    if (!open) form.reset()
    setDialogOpen(open)
  }

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await changePasswordAction(data.currentPassword, data.newPassword)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success("Password changed successfully")
      handleDialogChange(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded outline-none",
            "hover:opacity-80 focus-visible:ring-2 focus-visible:ring-foreground",
          )}
        >
          <AvatarInitials name={name} email={email} />
          <span className="hidden text-xs text-muted-foreground sm:block">{email}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <div className="px-1.5 py-1">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <KeyRound className="h-4 w-4" />
            Change Password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Current Password
              </label>
              <PasswordInput placeholder="••••••••" {...form.register("currentPassword")} />
              {form.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                New Password
              </label>
              <PasswordInput placeholder="Min. 8 characters" {...form.register("newPassword")} />
              {form.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Confirm New Password
              </label>
              <PasswordInput placeholder="Repeat new password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <DialogFooter className="mt-2">
              <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
