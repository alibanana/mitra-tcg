export const dynamic = "force-dynamic"
import { contactService } from "@/features/contact/services"
import { ContactTable } from "@/features/contact/components/contact-table"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Contact Submissions" }

export default async function ContactsPage() {
  const submissions = await contactService.getAllSubmissions().catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""} received
        </p>
      </div>

      <ContactTable submissions={submissions} />
    </div>
  )
}
