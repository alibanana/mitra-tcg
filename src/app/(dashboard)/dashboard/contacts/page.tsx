export const dynamic = "force-dynamic"
import { contactService } from "@/features/contact/services"
import { DataTable } from "@/components/dashboard/data-table"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Contact Submissions" }

export default async function ContactsPage() {
  const submissions = await contactService.getAllSubmissions().catch(() => [])

  const columns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Message", key: "message", render: "message" as const },
    { header: "Status", key: "read", render: "read" as const },
    { header: "Date", key: "createdAt", render: "date" as const },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""} received
        </p>
      </div>

      <DataTable
        columns={columns}
        data={submissions as unknown as Record<string, unknown>[]}
        emptyMessage="No contact submissions yet."
      />
    </div>
  )
}
