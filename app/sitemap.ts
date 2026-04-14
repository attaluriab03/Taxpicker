import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxpicker.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Tool pages
  const { data: tools } = await supabase
    .from('tools')
    .select('slug, updated_at')
    .eq('is_published', true)

  const toolPages: MetadataRoute.Sitemap = (tools || []).map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Article pages
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())

  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${siteUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...toolPages, ...articlePages]
}
