"use client"

import { useState, useTransition, type ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Trash2, KeyRound, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"
import { deleteUserAction, resetUserPasswordAction } from "@/features/users/actions"

interface TableUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

interface UserTableProps {
  users: TableUser[]
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
}

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetFormData = z.infer<typeof resetSchema>

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

export function UserTable({ users: initialUsers, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<TableUser | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  function openResetDialog(user: TableUser) {
    form.reset()
    setResetTarget(user)
  }

  function handleResetDialogChange(open: boolean) {
    if (!open) { form.reset(); setResetTarget(null) }
  }

  function confirmDelete() {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)
    startTransition(async () => {
      const result = await deleteUserAction(id)
      if ("error" in result) { toast.error(result.error); return }
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success("User deleted")
    })
  }

  function onResetSubmit(data: ResetFormData) {
    if (!resetTarget) return
    const id = resetTarget.id
    startTransition(async () => {
      const result = await resetUserPasswordAction(id, data.newPassword)
      if ("error" in result) { toast.error(result.error); return }
      toast.success("Password reset successfully")
      handleResetDialogChange(false)
    })
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto border-2 border-foreground md:block">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-foreground/10">
            {users.map((user) => {
              const isSelf = user.id === currentUserId
              const isSuperAdmin = user.role === "SUPER_ADMIN"
              return (
                <tr key={user.id} className={cn("hover:bg-muted/50", isSelf && "bg-muted/20")}>
                  <td className="px-4 py-3 font-medium">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && !isSuperAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => openResetDialog(user)}
                          disabled={isPending}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          <span className="sr-only">Reset password</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setPendingDeleteId(user.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="space-y-2 md:hidden">
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          const isSuperAdmin = user.role === "SUPER_ADMIN"
          return (
            <div key={user.id} className={cn("border-2 border-foreground p-3", isSelf && "bg-muted/20")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                {!isSelf && !isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => openResetDialog(user)}
                      disabled={isPending}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setPendingDeleteId(user.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The user will lose all access to the dashboard.
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

      {/* Reset password dialog */}
      <Dialog open={!!resetTarget} onOpenChange={handleResetDialogChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            {resetTarget && (
              <p className="text-sm text-muted-foreground">
                Set a new password for <span className="font-medium text-foreground">{resetTarget.name}</span>
              </p>
            )}
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onResetSubmit)} className="flex flex-col gap-4 py-2">
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
                Confirm Password
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
                {isPending ? "Saving..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      "px-2 py-0.5 text-xs font-bold uppercase",
      role === "SUPER_ADMIN" && "bg-foreground text-background",
      role === "ADMIN" && "bg-primary text-primary-foreground",
    )}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}
