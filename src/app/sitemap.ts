import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { productsService } from "@/features/products/services"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await productsService.getAllPublishedForSitemap().catch(() => [])

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteConfig.url}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
  ]
}
