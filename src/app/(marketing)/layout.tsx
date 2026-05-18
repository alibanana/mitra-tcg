import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { categoriesService } from "@/features/categories/services"

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const categories = await categoriesService.getCategoryTree()

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
