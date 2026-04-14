import type { Metadata } from 'next'
import { Tool, Article } from './supabase'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxpicker.io'
const siteName = 'Taxpicker'
const siteDescription =
  'Find, compare, and choose the best crypto tax software for your needs. Unbiased reviews, feature comparisons, and verified pricing.'

export function baseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} — Find the Best Crypto Tax Tool`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
      siteName,
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      title: `${siteName} — Find the Best Crypto Tax Tool`,
      description: siteDescription,
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} — Find the Best Crypto Tax Tool`,
      description: siteDescription,
    },
    alternates: {
      canonical: siteUrl,
    },
    ...overrides,
  }
}

export function toolMetadata(tool: Tool): Metadata {
  const title = `${tool.name} Review ${new Date().getFullYear()} — Pricing, Features & Ratings`
  const description =
    tool.description ||
    `Read our in-depth ${tool.name} review. Compare pricing, features, supported exchanges, and more.`
  const url = `${siteUrl}/tools/${tool.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: tool.logo_url ? [{ url: tool.logo_url, alt: tool.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export function articleMetadata(article: Article): Metadata {
  const title = article.title
  const description = article.meta_description || ''
  const url = `${siteUrl}/blog/${article.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      publishedTime: article.published_at || undefined,
      authors: article.author ? [article.author] : undefined,
      images: article.og_image_url
        ? [{ url: article.og_image_url, alt: title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
