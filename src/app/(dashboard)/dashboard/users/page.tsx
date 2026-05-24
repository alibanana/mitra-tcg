export const dynamic = "force-dynamic"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { fetchUsersAction } from "@/features/users/actions"
import { AddUserModal } from "@/features/users/components/add-user-modal"
import { UserTable } from "@/features/users/components/user-table"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Users" }

export default async function UsersPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/dashboard")

  const users = await fetchUsersAction().catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "user" : "users"}
          </p>
        </div>
        <AddUserModal />
      </div>
      <UserTable users={users} currentUserId={session.user.id} />
    </div>
  )
}
