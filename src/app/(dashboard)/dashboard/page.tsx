export const dynamic = "force-dynamic"
import { auth } from "@/lib/auth"
import { productsService } from "@/features/products/services"
import { contactService } from "@/features/contact/services"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Package, CheckCircle, Mail, ShoppingBag } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard Overview" }

export default async function DashboardPage() {
  const session = await auth()
  const [totalProducts, publishedProducts, soldProducts, contactCount] = await Promise.all([
    productsService.getProductCount().catch(() => 0),
    productsService.getPublishedCount().catch(() => 0),
    productsService.getSoldCount().catch(() => 0),
    contactService.getSubmissionCount().catch(() => 0),
  ])

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{today}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
          {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s a snapshot of your catalog.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Products" value={totalProducts} icon={Package} />
        <StatsCard title="Published" value={publishedProducts} icon={CheckCircle} />
        <StatsCard title="Sold" value={soldProducts} icon={ShoppingBag} />
        <StatsCard title="Inquiries" value={contactCount} icon={Mail} />
      </div>
    </div>
  )
}
