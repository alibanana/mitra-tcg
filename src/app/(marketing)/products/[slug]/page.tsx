export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import Link from "next/link"
import { productsService } from "@/features/products/services"
import { ProductGallery } from "@/components/products/product-gallery"
import { ProductCard } from "@/components/products/product-card"
import { CtaSection } from "@/components/marketing/cta-section"
import { buttonVariants } from "@/components/ui/button"
import { cn, normalizeUrl } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { settingsService } from "@/features/settings/services"
import type { Metadata } from "next"
import { PsaDataSection } from "@/components/products/psa-data-section"
import { MessageCircle } from "lucide-react"
import type { Product } from "@/features/products/types"

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await productsService.getProductBySlug(slug).catch(() => null)
  if (!product) return {}
  const description =
    product.description ||
    `${product.name} — available at Mitra TCG. English TCG singles shipped across Indonesia.`
  return {
    title: product.name,
    description,
    alternates: { canonical: `${siteConfig.url}/products/${slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `${siteConfig.url}/products/${slug}`,
      siteName: siteConfig.name,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = await productsService.getProductBySlug(slug).catch(() => null)

  if (!product || !product.published) notFound()

  const [related, rawWhatsappUrl, rawInstagramUrl] = await Promise.all([
    productsService.getRelatedProducts(product.id, product.categoryId).catch(() => []),
    settingsService.getValue("whatsapp_url"),
    settingsService.getValue("instagram_url"),
  ])

  const whatsappUrl = rawWhatsappUrl ? normalizeUrl(rawWhatsappUrl) : null
  const instagramUrl = rawInstagramUrl || siteConfig.instagram
  const inquiryUrl = whatsappUrl
    ? `${whatsappUrl}?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}`
    : instagramUrl

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} — available at Mitra TCG. English TCG singles shipped across Indonesia.`,
    image: product.images,
    url: `${siteConfig.url}/products/${product.slug}`,
    brand: { "@type": "Brand", name: "Mitra TCG" },
    offers: {
      "@type": "Offer",
      seller: { "@type": "Organization", name: "Mitra TCG" },
      availability: product.sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      url: `${siteConfig.url}/products/${product.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-border bg-background py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Gallery */}
            <ProductGallery images={product.images} name={product.name} />

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border px-3 py-0.5 text-xs font-semibold">
                    {product.category.name}
                  </span>
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl">{product.name}</h1>
              </div>

              <a
                href={inquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "site-btn-primary w-full justify-center",
                  product.sold && "pointer-events-none opacity-50",
                )}
              >
                {product.sold ? "Sold Out" : (
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message for pricing
                  </span>
                )}
              </a>

              {product.psaCert && (
                <PsaDataSection psaCert={product.psaCert} inline={!product.description} />
              )}

              {product.description && (
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl">Related Cards</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {related.map((r) => (
                  <ProductCard key={r.id} product={r as unknown as Product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <CtaSection />
    </>
  )
}
