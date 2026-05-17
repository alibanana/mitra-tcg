import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

interface GenerateMetadataOptions {
  title: string
  description: string
  path?: string
  image?: string
}

export function generateMetadata({
  title,
  description,
  path = "",
  image,
}: GenerateMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`
  const ogImage = image || `${siteConfig.url}/og-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: ogImage }],
    },
    alternates: { canonical: url },
  }
}

export function generateArticleMetadata({
  title,
  description,
  path,
  publishedTime,
  author,
}: GenerateMetadataOptions & { publishedTime?: string; author?: string }): Metadata {
  const base = generateMetadata({ title, description, path })
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "article", publishedTime, authors: author ? [author] : undefined },
  }
}
